/**
 * Cache Manager
 *
 * Extends MultipleInstanceManager from @abdokouta/react-support.
 * Uses RedisService from @abdokouta/react-redis for Redis connections.
 *
 * @module services/cache-manager
 */

import { MultipleInstanceManager } from '@abdokouta/react-support';
import type { RedisService } from '@abdokouta/react-redis';

import type { StoreConfig } from '@/types';
import type { Store, CacheModuleOptions } from '@/interfaces';
import { MemoryStore } from '@/stores/memory.store';
import { RedisStore } from '@/stores/redis.store';
import { NullStore } from '@/stores/null.store';
import { Injectable, Inject, Optional } from '@abdokouta/react-di';
import { CACHE_CONFIG } from '@/constants/tokens.constant';
import { CacheService } from './cache.service';

/** DI token for RedisService from @abdokouta/react-redis. */
const REDIS_SERVICE_TOKEN = Symbol.for('RedisService');

@Injectable()
export class CacheManager extends MultipleInstanceManager<Store> {
  /** Cache module configuration (injected via DI). */
  private readonly config: CacheModuleOptions;

  /**
   * Optional RedisService from @abdokouta/react-redis.
   * Only needed when using the 'redis' driver.
   */
  private readonly redisService?: RedisService;

  constructor(
    @Inject(CACHE_CONFIG) config: CacheModuleOptions,
    @Optional() @Inject(REDIS_SERVICE_TOKEN) redisService?: RedisService,
  ) {
    super();
    this.config = config;
    this.redisService = redisService;
  }

  // ── MultipleInstanceManager implementations ─────────────────────────────

  getDefaultInstance(): string {
    return this.config.default;
  }

  getInstanceConfig(name: string): Record<string, any> | undefined {
    return this.config.stores[name];
  }

  protected createDriver(driver: string, config: Record<string, any>): Store {
    const storeConfig = config as StoreConfig;
    const prefix = this.buildPrefix(storeConfig);

    switch (driver) {
      case 'memory':
        return new MemoryStore({ ttl: storeConfig.ttl, maxSize: (storeConfig as any).maxSize, prefix });
      case 'redis':
        return this.createRedisDriver(storeConfig, prefix);
      case 'null':
        return new NullStore({ prefix });
      default:
        throw new Error(`Cache driver [${driver}] is not supported.`);
    }
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Get a CacheService for the given store. */
  store(name?: string): CacheService {
    const storeName = name ?? this.getDefaultInstance();
    const storeInstance = this.instance(storeName);
    const storeConfig = this.config.stores[storeName];

    return new CacheService(storeInstance, storeConfig?.ttl ?? 300);
  }

  getDefaultDriver(): string { return this.getDefaultInstance(); }
  getStoreNames(): string[] { return Object.keys(this.config.stores); }
  hasStore(name: string): boolean { return name in this.config.stores; }
  getGlobalPrefix(): string { return this.config.prefix ?? ''; }

  // ── Private ─────────────────────────────────────────────────────────────

  /** Create a Redis store using RedisService from @abdokouta/react-redis. */
  private createRedisDriver(config: StoreConfig, prefix: string): RedisStore {
    if (!this.redisService) {
      throw new Error(
        'Redis cache driver requires @abdokouta/react-redis.\n' +
          'Import RedisModule.forRoot() in your AppModule before CacheModule.forRoot().',
      );
    }

    const connectionName = (config as any).connection ?? 'default';

    return new RedisStore(this.redisService, prefix, connectionName);
  }

  private buildPrefix(config: StoreConfig): string {
    return (this.config.prefix ?? '') + (config.prefix ?? '');
  }
}
