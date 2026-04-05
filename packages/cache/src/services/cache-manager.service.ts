/**
 * Cache Manager
 *
 * Concrete manager for the cache system. Extends BaseManager to handle
 * multiple named cache stores, each backed by a different driver.
 *
 * Config is injected via `@Inject(CACHE_CONFIG)`. The optional Redis
 * factory is injected via `@Inject(REDIS_FACTORY)` when available.
 *
 * Users typically interact with CacheRepository (via CACHE_SERVICE),
 * not this class directly. Use `manager.store('name')` to get a
 * repository for a specific store.
 *
 * @module services/cache-manager
 */

import { MultipleInstanceManager } from '@abdokouta/react-support';

import type { StoreConfig } from '@/types';
import type {
  Store,
  CacheModuleOptions,
  RedisFactory,
} from '@/interfaces';
import { MemoryStore } from '@/stores/memory.store';
import { RedisStore } from '@/stores/redis.store';
import { NullStore } from '@/stores/null.store';
import { Injectable, Inject, Optional } from '@abdokouta/react-di';
import { CACHE_CONFIG, REDIS_FACTORY } from '@/constants/tokens.constant';
import { CacheService } from './cache.service';

/**
 * Cache Manager
 *
 * Resolves named cache stores and wraps them in CacheRepository instances.
 *
 * @example
 * ```typescript
 * const cache = cacheManager.store();        // default store
 * const redis = cacheManager.store('redis'); // specific store
 *
 * cacheManager.extend('dynamodb', (config) => new DynamoStore(config));
 * ```
 */
@Injectable()
export class CacheManager extends MultipleInstanceManager<Store> {
  /**
   * Cache module configuration, injected via DI.
   */
  private readonly config: CacheModuleOptions;

  /**
   * Optional Redis factory for resolving named Redis connections.
   * Only required when using the 'redis' driver.
   */
  private readonly redisFactory?: RedisFactory;

  constructor(
    @Inject(CACHE_CONFIG) config: CacheModuleOptions,
    @Optional() @Inject(REDIS_FACTORY) redisFactory?: RedisFactory,
  ) {
    super();
    this.config = config;
    this.redisFactory = redisFactory;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BaseManager abstract implementations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get the default store name from injected config.
   */
  getDefaultInstance(): string {
    return this.config.default;
  }

  /**
   * Get the config for a named store from injected config.
   */
  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.config.stores[name];
  }

  /**
   * Create a store instance for a built-in driver.
   *
   * Dispatches to the appropriate create method based on driver name.
   * Custom drivers registered via `extend()` are handled by BaseManager
   * before this method is called.
   */
  protected createDriver(driver: string, config: Record<string, any>): Store {
    const storeConfig = config as StoreConfig;
    const prefix = this.buildPrefix(storeConfig);

    switch (driver) {
      case 'memory':
        return this.createMemoryDriver(storeConfig, prefix);

      case 'redis':
        return this.createRedisDriver(storeConfig, prefix);

      case 'null':
        return this.createNullDriver(prefix);

      default:
        throw new Error(`Cache driver [${driver}] is not supported.`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Public API (cache-specific)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get a CacheService for the given store.
   *
   * Resolves the raw Store via BaseManager (which caches it),
   * then wraps it in a new CacheService.
   *
   * @param name - Store name (uses default if omitted)
   * @returns CacheService wrapping the resolved store
   */
  store(name?: string): CacheService {
    const storeName = name ?? this.getDefaultInstance();
    const storeInstance = this.instance(storeName);
    const storeConfig = this.config.stores[storeName];
    const defaultTtl = storeConfig?.ttl ?? 300;

    return new CacheService(storeInstance, defaultTtl);
  }

  /**
   * Get the default driver (store) name.
   *
   * Alias for `getDefaultInstance()` matching Laravel's naming.
   */
  getDefaultDriver(): string {
    return this.getDefaultInstance();
  }

  /**
   * Get all configured store names.
   */
  getStoreNames(): string[] {
    return Object.keys(this.config.stores);
  }

  /**
   * Check if a store is configured.
   */
  hasStore(name: string): boolean {
    return name in this.config.stores;
  }

  /**
   * Get the global cache key prefix.
   */
  getPrefix(): string {
    return this.config.prefix ?? '';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Driver Creators (private)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Create a memory cache driver.
   */
  private createMemoryDriver(config: StoreConfig, prefix: string): MemoryStore {
    return new MemoryStore({
      ttl: config.ttl,
      maxSize: (config as any).maxSize,
      prefix,
    });
  }

  /**
   * Create a Redis cache driver.
   *
   * The config contains a connection name (string). The actual Redis
   * client is resolved via the RedisFactory from DI — matching Laravel's
   * `$this->app['redis']->connection($config['connection'])` pattern.
   */
  private createRedisDriver(config: StoreConfig, prefix: string): RedisStore {
    if (!this.redisFactory) {
      throw new Error(
        'Redis cache driver requires a RedisFactory registered under the REDIS_FACTORY token.\n\n' +
          'Example:\n' +
          '  import { REDIS_FACTORY } from "@abdokouta/react-cache";\n' +
          '  { provide: REDIS_FACTORY, useClass: MyRedisFactory }'
      );
    }

    const connectionName = (config as any).connection ?? 'default';

    return new RedisStore(this.redisFactory, prefix, connectionName);
  }

  /**
   * Create a null (no-op) cache driver.
   */
  private createNullDriver(prefix: string): NullStore {
    return new NullStore({ prefix });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helpers (private)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Build the combined cache key prefix (global + store-specific).
   */
  private buildPrefix(config: StoreConfig): string {
    const globalPrefix = this.config.prefix ?? '';
    const storePrefix = config.prefix ?? '';

    return globalPrefix + storePrefix;
  }
}
