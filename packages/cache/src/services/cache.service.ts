/**
 * Cache Service
 *
 * Main cache service that handles stores internally (NO separate manager or repository).
 * Provides high-level cache operations with support for multiple stores.
 *
 * **Architecture:**
 * - Manages stores internally (no separate CacheManager)
 * - Provides Laravel-inspired Repository-style API directly
 * - Supports multiple cache drivers (memory, redis, null)
 * - Lazy store initialization
 * - Tagged caching support (Redis only)
 *
 * **Laravel Comparison:**
 * - `Cache::get()` → `cacheService.get()`
 * - `Cache::put()` → `cacheService.put()`
 * - `Cache::remember()` → `cacheService.remember()`
 * - `Cache::tags()` → `cacheService.tags()`
 * - `Cache::store()` → `cacheService.store()`
 *
 * @example
 * ```typescript
 * // Basic operations
 * await cacheService.put('key', 'value', 3600);
 * const value = await cacheService.get('key');
 *
 * // Remember pattern (get-or-set)
 * const user = await cacheService.remember('user:123', 3600, async () => {
 *   return await fetchUserFromDatabase(123);
 * });
 *
 * // Tagged caching (Redis only)
 * await cacheService.tags(['users', 'premium']).put('user:456', user, 3600);
 * await cacheService.tags(['premium']).flush();
 *
 * // Multiple stores
 * const redisCache = cacheService.store('redis');
 * await redisCache.put('key', 'value', 3600);
 * ```
 *
 * @module services/cache
 */
import type { StoreConfig } from '@/types';
import { NullStore } from '@/stores/null.store';
import { RedisStore } from '@/stores/redis.store';
import { MemoryStore } from '@/stores/memory.store';
import { Injectable, Inject } from '@abdokouta/react-di';
import { CACHE_CONFIG } from '@/constants/tokens.constant';
import type { TaggedCache, Store, TaggableStore, CacheModuleOptions } from '@/interfaces';
import type { CacheServiceInterface } from '@/interfaces/cache-service.interface';

/**
 * Cache service implementation
 *
 * Provides a high-level API for cache operations with convenient helper methods.
 *
 * @example
 * ```typescript
 * const cache = new service(store);
 *
 * // Basic operations
 * await cache.put('key', 'value', 3600);
 * const value = await cache.get('key');
 *
 * // Remember pattern (get-or-set)
 * const user = await cache.remember('user:123', 3600, async () => {
 *   return await fetchUserFromDatabase(123);
 * });
 *
 * // Tagged caching
 * await cache.tags(['users', 'premium']).put('user:456', user, 3600);
 * await cache.tags(['premium']).flush();
 * ```
 */
@Injectable()
export class CacheService implements CacheServiceInterface {
  /**
   * Cache configuration
   */
  private readonly config: CacheModuleOptions;

  /**
   * Cached store instances
   */
  private stores: Map<string, Store> = new Map();

  /**
   * Default store instance
   */
  private defaultStore?: Store;

  /**
   * Create a new cache service
   *
   * @param config - Cache configuration
   */
  constructor(@Inject(CACHE_CONFIG) config: CacheModuleOptions) {
    this.config = config;
  }

  /**
   * Get a cache store instance
   *
   * Returns the specified store, or the default store if no name is provided.
   * Stores are lazily initialized and cached.
   *
   * @param name - Store name (uses default if not specified)
   * @returns Store instance
   * @throws Error if store is not configured
   *
   * @example
   * ```typescript
   * // Use default store
   * const cache = cacheService.store();
   * await cache.put('key', 'value', 3600);
   *
   * // Use specific store
   * const redisCache = cacheService.store('redis');
   * await redisCache.put('key', 'value', 3600);
   * ```
   */
  store(name?: string): CacheService {
    const storeName = name ?? this.config.default;

    // Return cached store if exists
    if (this.stores.has(storeName)) {
      // Create a new CacheService instance with this store as default
      const service = new CacheService(this.config);
      service.defaultStore = this.stores.get(storeName);
      service.stores = this.stores;
      return service;
    }

    // Resolve and cache new store
    const store = this.resolve(storeName);
    this.stores.set(storeName, store);

    // Create a new CacheService instance with this store as default
    const service = new CacheService(this.config);
    service.defaultStore = store;
    service.stores = this.stores;
    return service;
  }

  /**
   * Determine if an item exists in the cache
   *
   * @param key - Cache key
   * @returns True if the item exists
   *
   * @example
   * ```typescript
   * if (await cache.has('user:123')) {
   *   console.log('User is cached');
   * }
   * ```
   */
  has(key: string): Promise<boolean> {
    return this.get(key).then((value) => value !== undefined && value !== null);
  }

  /**
   * Retrieve an item from the cache
   *
   * @param key - Cache key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The cached value or default value
   *
   * @example
   * ```typescript
   * const user = await cache.get('user:123', { name: 'Guest' });
   * ```
   */
  get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const store = this.getDefaultStore();
    return store.get(key).then((value) => (value !== undefined ? value : defaultValue));
  }

  /**
   * Retrieve multiple items from the cache
   *
   * @param keys - Array of cache keys
   * @returns Object mapping keys to values
   *
   * @example
   * ```typescript
   * const data = await cache.many(['user:1', 'user:2', 'user:3']);
   * ```
   */
  many<T = any>(keys: string[]): Promise<Record<string, T>> {
    const store = this.getDefaultStore();
    return store.many(keys);
  }

  /**
   * Store an item in the cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - TTL in seconds (default: from config)
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await cache.put('user:123', { name: 'John' }, 3600);
   * ```
   */
  put<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    const store = this.getDefaultStore();
    const seconds = ttl ?? this.getDefaultTtl();
    return store.put(key, value, seconds);
  }

  /**
   * Store multiple items in the cache
   *
   * @param values - Object mapping keys to values
   * @param ttl - TTL in seconds (default: from config)
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await cache.putMany({
   *   'user:1': user1,
   *   'user:2': user2
   * }, 3600);
   * ```
   */
  putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean> {
    const store = this.getDefaultStore();
    const seconds = ttl ?? this.getDefaultTtl();
    return store.putMany(values, seconds);
  }

  /**
   * Store an item in the cache if it doesn't exist
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - TTL in seconds (default: from config)
   * @returns True if the item was added, false if it already existed
   *
   * @example
   * ```typescript
   * const added = await cache.add('user:123', user, 3600);
   * if (added) {
   *   console.log('User was cached');
   * } else {
   *   console.log('User already exists in cache');
   * }
   * ```
   */
  async add<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    const exists = await this.has(key);
    if (exists) {
      return false;
    }

    return this.put(key, value, ttl);
  }

  /**
   * Increment a numeric value in the cache
   *
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value
   *
   * @example
   * ```typescript
   * await cache.increment('page:views');      // 1
   * await cache.increment('page:views', 10);  // 11
   * ```
   */
  increment(key: string, value: number = 1): Promise<number> {
    const store = this.getDefaultStore();
    return store.increment(key, value).then((result) => (typeof result === 'number' ? result : 0));
  }

  /**
   * Decrement a numeric value in the cache
   *
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value
   *
   * @example
   * ```typescript
   * await cache.decrement('stock:product:123');     // -1
   * await cache.decrement('stock:product:123', 5);  // -6
   * ```
   */
  decrement(key: string, value: number = 1): Promise<number> {
    const store = this.getDefaultStore();
    return store.decrement(key, value).then((result) => (typeof result === 'number' ? result : 0));
  }

  /**
   * Store an item indefinitely
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await cache.forever('config:app', { theme: 'dark' });
   * ```
   */
  forever<T = any>(key: string, value: T): Promise<boolean> {
    const store = this.getDefaultStore();
    return store.forever(key, value);
  }

  /**
   * Get an item from the cache, or execute the callback and store the result
   *
   * This is the "remember" pattern from Laravel - get from cache if exists,
   * otherwise execute callback, store result, and return it.
   *
   * @param key - Cache key
   * @param ttl - TTL in seconds
   * @param callback - Function to execute if cache miss
   * @returns The cached or computed value
   *
   * @example
   * ```typescript
   * const user = await cache.remember('user:123', 3600, async () => {
   *   return await database.users.findById(123);
   * });
   * ```
   */
  async remember<T = any>(key: string, ttl: number, callback: () => Promise<T> | T): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await callback();
    await this.put(key, value, ttl);

    return value;
  }

  /**
   * Get an item from the cache, or execute the callback and store the result forever
   *
   * Like remember(), but stores the result indefinitely.
   *
   * @param key - Cache key
   * @param callback - Function to execute if cache miss
   * @returns The cached or computed value
   *
   * @example
   * ```typescript
   * const config = await cache.rememberForever('app:config', async () => {
   *   return await loadConfigFromFile();
   * });
   * ```
   */
  async rememberForever<T = any>(key: string, callback: () => Promise<T> | T): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await callback();
    await this.forever(key, value);

    return value;
  }

  /**
   * Retrieve an item from the cache and delete it
   *
   * @param key - Cache key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The cached value or default value
   *
   * @example
   * ```typescript
   * const token = await cache.pull('auth:token:abc123');
   * // Token is now removed from cache
   * ```
   */
  async pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.get<T>(key, defaultValue);
    await this.forget(key);
    return value;
  }

  /**
   * Remove an item from the cache
   *
   * @param key - Cache key
   * @returns True if the item was removed
   *
   * @example
   * ```typescript
   * await cache.forget('user:123');
   * ```
   */
  forget(key: string): Promise<boolean> {
    const store = this.getDefaultStore();
    return store.forget(key);
  }

  /**
   * Remove all items from the cache
   *
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await cache.flush(); // Clear entire cache
   * ```
   */
  flush(): Promise<boolean> {
    const store = this.getDefaultStore();
    return store.flush();
  }

  /**
   * Begin executing a new tags operation
   *
   * Only available if the store supports tagging (e.g., Redis).
   *
   * @param names - Array of tag names
   * @returns A TaggedCache instance
   * @throws Error if the store doesn't support tagging
   *
   * @example
   * ```typescript
   * const taggedCache = cache.tags(['users', 'premium']);
   * await taggedCache.put('user:123', user, 3600);
   * await taggedCache.flush(); // Flush all premium users
   * ```
   */
  tags(names: string[]): TaggedCache {
    const store = this.getDefaultStore();

    if (!this.isTaggableStore(store)) {
      throw new Error(
        `Cache store [${store.constructor.name}] does not support tagging. ` +
          'Only Redis store supports cache tagging.'
      );
    }

    return store.tags(names);
  }

  /**
   * Get the cache key prefix
   *
   * @returns The prefix string
   */
  getPrefix(): string {
    const store = this.getDefaultStore();
    return store.getPrefix();
  }

  /**
   * Get the default store name
   *
   * @returns Default store name
   */
  getDefaultStoreName(): string {
    return this.config.default;
  }

  /**
   * Get all configured store names
   *
   * @returns Array of store names
   */
  getStoreNames(): string[] {
    return Object.keys(this.config.stores);
  }

  /**
   * Check if a store is configured
   *
   * @param name - Store name
   * @returns True if the store is configured
   */
  hasStore(name: string): boolean {
    return name in this.config.stores;
  }

  /**
   * Flush all stores
   *
   * Clears all cached data across all stores.
   *
   * @returns True if all stores were flushed successfully
   *
   * @example
   * ```typescript
   * await cache.flushAll();
   * ```
   */
  async flushAll(): Promise<boolean> {
    const results = await Promise.all(
      Array.from(this.stores.values()).map((store) => store.flush())
    );

    return results.every((result) => result === true);
  }

  /**
   * Get the default store instance
   *
   * @returns Store instance
   * @throws Error if default store cannot be resolved
   * @private
   */
  private getDefaultStore(): Store {
    if (this.defaultStore) {
      return this.defaultStore;
    }

    // Lazy initialize default store
    const storeName = this.config.default;

    if (this.stores.has(storeName)) {
      this.defaultStore = this.stores.get(storeName)!;
      return this.defaultStore;
    }

    this.defaultStore = this.resolve(storeName);
    this.stores.set(storeName, this.defaultStore);

    return this.defaultStore;
  }

  /**
   * Resolve a store by name
   *
   * Creates a new store instance based on configuration.
   *
   * @param name - Store name
   * @returns Store instance
   * @throws Error if store is not configured or driver is invalid
   * @private
   */
  private resolve(name: string): Store {
    const storeConfig = this.config.stores[name];

    if (!storeConfig) {
      throw new Error(`Cache store [${name}] is not configured`);
    }

    // Build prefix (global + store-specific)
    const prefix = this.buildPrefix(storeConfig);

    // Create store based on driver
    switch (storeConfig.driver) {
      case 'memory':
        return this.createMemoryStore(storeConfig, prefix);

      case 'redis':
        return this.createRedisStore(storeConfig, prefix);

      case 'null':
        return this.createNullStore(prefix);

      default: {
        // TypeScript exhaustiveness check - this should never be reached
        const driver = (storeConfig as any).driver;
        throw new Error(`Cache driver [${driver}] is not supported`);
      }
    }
  }

  /**
   * Create a memory store
   *
   * @param config - Store configuration
   * @param prefix - Cache key prefix
   * @returns MemoryStore instance
   * @private
   */
  private createMemoryStore(config: StoreConfig, prefix: string): MemoryStore {
    // Runtime check - config should be MemoryStoreConfig
    return new MemoryStore({
      ttl: config.ttl,
      maxSize: (config as any).maxSize,
      prefix,
    });
  }

  /**
   * Create a Redis store
   *
   * @param config - Store configuration
   * @param prefix - Cache key prefix
   * @returns RedisStore instance
   * @throws Error if Redis is not supported yet
   * @private
   */
  private createRedisStore(_config: StoreConfig, _prefix: string): RedisStore {
    throw new Error(
      'Redis store is not yet implemented. ' +
        'Please use MemoryStore or NullStore for now. ' +
        'Redis support will be added in a future update.'
    );
  }

  /**
   * Create a null store
   *
   * @param prefix - Cache key prefix
   * @returns NullStore instance
   * @private
   */
  private createNullStore(prefix: string): NullStore {
    return new NullStore({ prefix });
  }

  /**
   * Build cache key prefix
   *
   * Combines global prefix with store-specific prefix.
   *
   * @param config - Store configuration
   * @returns Combined prefix
   * @private
   */
  private buildPrefix(config: StoreConfig): string {
    const globalPrefix = this.config.prefix ?? '';
    const storePrefix = config.prefix ?? '';
    return globalPrefix + storePrefix;
  }

  /**
   * Get default TTL for the current store
   *
   * @returns Default TTL in seconds
   * @private
   */
  private getDefaultTtl(): number {
    const storeName = this.config.default;
    const storeConfig = this.config.stores[storeName];
    return storeConfig?.ttl ?? 300; // 5 minutes default
  }

  /**
   * Type guard to check if store supports tagging
   *
   * @param store - The store to check
   * @returns True if the store supports tagging
   * @private
   */
  private isTaggableStore(store: Store): store is TaggableStore {
    return 'tags' in store && typeof (store as any).tags === 'function';
  }
}
