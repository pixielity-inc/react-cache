/**
 * Cache Manager
 *
 * The central orchestrator for the cache system. Manages multiple named
 * cache stores using the `MultipleInstanceManager` pattern.
 *
 * Each store is lazily created on first access, cached internally, and
 * reused on subsequent calls. The manager creates low-level `Store`
 * instances (memory, redis, null) and wraps them in `CacheService`
 * instances that provide the high-level API (remember, tags, etc.).
 *
 * ## Architecture
 *
 * ```
 * CacheManager (this class)
 *   ├── extends MultipleInstanceManager<Store>
 *   ├── creates Store instances (MemoryStore, RedisStore, NullStore)
 *   └── wraps them in CacheService (the consumer-facing API)
 * ```
 *
 * ## Lifecycle
 *
 * - `OnModuleInit` — eagerly creates the default store
 * - `OnModuleDestroy` — flushes all stores and releases resources
 *
 * @module services/cache-manager
 */

import {
  Injectable,
  Inject,
  Optional,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@abdokouta/ts-container';
import { MultipleInstanceManager } from '@abdokouta/react-support';

import type { Store, CacheModuleOptions } from '@/interfaces';
import type { StoreConfig } from '@/types';
import { REDIS_MANAGER, type IRedisService } from '@abdokouta/react-redis';
import { MemoryStore } from '@/stores/memory.store';
import { RedisStore } from '@/stores/redis.store';
import { NullStore } from '@/stores/null.store';
import { CacheService } from './cache.service';
import { CACHE_CONFIG } from '@/constants/tokens.constant';

/**
 * CacheManager — creates and manages multiple named cache stores.
 *
 * @example
 * ```typescript
 * const cache = manager.store();
 * await cache.remember('key', 3600, () => fetchData());
 *
 * const redis = manager.store('redis');
 * await redis.tags(['users']).flush();
 *
 * manager.extend('custom', (config) => new MyStore(config));
 * ```
 */
@Injectable()
export class CacheManager
  extends MultipleInstanceManager<Store>
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Cached CacheService wrappers, keyed by store name.
   * Separate from the base class's Store cache — this caches
   * the high-level CacheService wrappers.
   */
  private readonly services: Map<string, CacheService> = new Map();

  /**
   * @param config - Cache module configuration (default store, stores, prefix)
   * @param redisService - Optional RedisManager for Redis-backed stores.
   *   Injected automatically if RedisModule.forRoot() is imported.
   */
  constructor(
    @Inject(CACHE_CONFIG) private readonly config: CacheModuleOptions,
    @Optional() @Inject(REDIS_MANAGER) private readonly redisService?: IRedisService,
  ) {
    super();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Called after all providers are instantiated.
   * Eagerly creates the default store to catch config errors early.
   * If the default store requires Redis and it's not available,
   * logs a warning instead of crashing.
   */
  onModuleInit(): void {
    try {
      this.store();
    } catch (err) {
      console.warn(
        `[CacheManager] Failed to create default store '${this.config.default}':`,
        (err as Error).message,
      );
    }
  }

  /**
   * Called on `app.close()`.
   * Flushes all stores and clears internal caches.
   * Errors during flush are silently ignored.
   */
  async onModuleDestroy(): Promise<void> {
    for (const [, service] of this.services) {
      try { await service.flush(); } catch { /* ignore */ }
    }
    this.services.clear();
    this.purge();
  }

  // ── MultipleInstanceManager contract ────────────────────────────────────

  /** Get the default store name from config. */
  getDefaultInstance(): string {
    return this.config.default;
  }

  /** Change the default store at runtime. */
  setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  /**
   * Get the configuration for a named store.
   * Must include a `driver` field ('memory', 'redis', 'null').
   */
  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.config.stores[name];
  }

  /**
   * Create a store driver instance.
   *
   * Called by the base class when a store is requested for the first time.
   * Dispatches to MemoryStore, RedisStore, or NullStore based on the
   * `driver` field in the config.
   *
   * @param driver - Driver name ('memory', 'redis', 'null')
   * @param config - Raw store configuration
   * @returns A new Store instance
   * @throws Error if the driver is not supported
   */
  protected createDriver(driver: string, config: Record<string, any>): Store {
    const storeConfig = config as StoreConfig;
    const prefix = this.buildPrefix(storeConfig);

    switch (driver) {
      case 'memory':
        return new MemoryStore({
          ttl: storeConfig.ttl,
          maxSize: (storeConfig as any).maxSize,
          prefix,
        });
      case 'redis':
        return this.createRedisStore(storeConfig, prefix);
      case 'null':
        return new NullStore({ prefix });
      default:
        throw new Error(`Cache driver [${driver}] is not supported.`);
    }
  }

  // ── Store access ────────────────────────────────────────────────────────

  /**
   * Get a CacheService for a named store.
   *
   * The primary consumer API. Returns a CacheService wrapping the
   * underlying Store with get, put, remember, tags, etc.
   * Cached — subsequent calls return the same instance.
   *
   * @param name - Store name. Uses default if omitted.
   */
  store(name?: string): CacheService {
    const storeName = name ?? this.config.default;

    const existing = this.services.get(storeName);
    if (existing) return existing;

    const storeInstance = this.instance(storeName);
    const storeConfig = this.config.stores[storeName];
    const service = new CacheService(storeInstance, storeConfig?.ttl ?? 300);

    this.services.set(storeName, service);
    return service;
  }

  // ── Introspection ───────────────────────────────────────────────────────

  /** Get the default driver/store name. */
  getDefaultDriver(): string {
    return this.config.default;
  }

  /** Get all configured store names (from config, not just active). */
  getStoreNames(): string[] {
    return Object.keys(this.config.stores);
  }

  /** Check if a store is configured (exists in config). */
  hasStore(name: string): boolean {
    return name in this.config.stores;
  }

  /** Get the global cache key prefix. */
  getGlobalPrefix(): string {
    return this.config.prefix ?? '';
  }

  // ── Cache management ────────────────────────────────────────────────────

  /**
   * Forget a cached store and its CacheService wrapper.
   * Forces re-creation on next `store()` call.
   *
   * @param name - Store name(s). Uses default if omitted.
   */
  forgetStore(name?: string | string[]): this {
    const names = name
      ? (Array.isArray(name) ? name : [name])
      : [this.config.default];
    for (const n of names) { this.services.delete(n); }
    return this.forgetInstance(name);
  }

  /** Clear all cached stores and CacheService wrappers. */
  override purge(): void {
    this.services.clear();
    super.purge();
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  /**
   * Create a Redis-backed cache store.
   * Requires RedisModule.forRoot() to be imported before CacheModule.forRoot().
   *
   * @param config - Store config (must have `connection` field)
   * @param prefix - Computed cache key prefix
   * @throws Error if RedisManager is not available
   */
  private createRedisStore(config: StoreConfig, prefix: string): RedisStore {
    if (!this.redisService) {
      throw new Error(
        'Redis cache driver requires @abdokouta/react-redis.\n' +
        'Import RedisModule.forRoot() before CacheModule.forRoot().',
      );
    }
    return new RedisStore(
      this.redisService,
      prefix,
      (config as any).connection ?? 'default',
    );
  }

  /**
   * Build the full cache key prefix for a store.
   * Combines global prefix + store-specific prefix.
   * Example: 'app_' + 'cache_' = 'app_cache_'
   */
  private buildPrefix(config: StoreConfig): string {
    return (this.config.prefix ?? '') + (config.prefix ?? '');
  }
}
