/**
 * Cache Service
 *
 * The public-facing API for cache operations, wrapping a single Store instance.
 * This mirrors Laravel's `Illuminate\Cache\Service` — all the convenient
 * methods like `remember`, `pull`, `add`, `tags` live here.
 *
 * Users never create this directly. It's returned by `CacheManager.store()`.
 *
 * **Laravel Comparison:**
 * - `Cache::get('key')` → `service.get('key')`
 * - `Cache::put('key', val, 3600)` → `service.put('key', val, 3600)`
 * - `Cache::remember('key', 3600, fn)` → `service.remember('key', 3600, fn)`
 * - `Cache::tags(['users'])->flush()` → `service.tags(['users']).flush()`
 * - `Cache::pull('key')` → `service.pull('key')`
 * - `Cache::add('key', val, 3600)` → `service.add('key', val, 3600)`
 *
 * @module services/cache-service
 */

import type { Store, TaggableStore, TaggedCache } from '@/interfaces';

/**
 * Cache Service
 *
 * Wraps a single Store and provides the full cache API.
 *
 * @example
 * ```typescript
 * const cache = cacheManager.store(); // returns CacheService
 *
 * await cache.put('user:123', user, 3600);
 * const user = await cache.get('user:123');
 *
 * const data = await cache.remember('key', 600, async () => fetchData());
 *
 * await cache.tags(['users']).flush(); // Redis only
 * ```
 */
export class CacheService {
  /**
   * The underlying cache store.
   */
  private readonly store: Store;

  /**
   * Default TTL in seconds, from the store's config.
   */
  private readonly defaultTtl: number;

  /**
   * Create a new cache service.
   *
   * @param store - The Store instance to wrap
   * @param defaultTtl - Default TTL in seconds (used when no TTL is specified)
   */
  constructor(store: Store, defaultTtl: number = 300) {
    this.store = store;
    this.defaultTtl = defaultTtl;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Read Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Determine if an item exists in the cache.
   *
   * @param key - Cache key
   * @returns True if the key exists and is not undefined/null
   */
  async has(key: string): Promise<boolean> {
    const value = await this.store.get(key);

    return value !== undefined && value !== null;
  }

  /**
   * Retrieve an item from the cache.
   *
   * @param key - Cache key
   * @param defaultValue - Returned if the key doesn't exist
   * @returns The cached value, or the default
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.store.get(key);

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Retrieve multiple items from the cache.
   *
   * @param keys - Array of cache keys
   * @returns Object mapping keys to their values
   */
  async many<T = any>(keys: string[]): Promise<Record<string, T>> {
    return this.store.many(keys);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Write Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Store an item in the cache.
   *
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - TTL in seconds (defaults to store config TTL)
   * @returns True if successful
   */
  async put<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.store.put(key, value, ttl ?? this.defaultTtl);
  }

  /**
   * Store multiple items in the cache.
   *
   * @param values - Object mapping keys to values
   * @param ttl - TTL in seconds (defaults to store config TTL)
   * @returns True if successful
   */
  async putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean> {
    return this.store.putMany(values, ttl ?? this.defaultTtl);
  }

  /**
   * Store an item only if the key doesn't already exist.
   *
   * @param key - Cache key
   * @param value - Value to store
   * @param ttl - TTL in seconds
   * @returns True if the item was added, false if it already existed
   */
  async add<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (await this.has(key)) {
      return false;
    }

    return this.put(key, value, ttl);
  }

  /**
   * Store an item indefinitely (no expiration).
   *
   * @param key - Cache key
   * @param value - Value to store
   * @returns True if successful
   */
  async forever<T = any>(key: string, value: T): Promise<boolean> {
    return this.store.forever(key, value);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Increment / Decrement
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Increment a numeric value.
   *
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing
   */
  async increment(key: string, value: number = 1): Promise<number> {
    const result = await this.store.increment(key, value);

    return typeof result === 'number' ? result : 0;
  }

  /**
   * Decrement a numeric value.
   *
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    const result = await this.store.decrement(key, value);

    return typeof result === 'number' ? result : 0;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Remember Pattern (get-or-set)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get an item, or execute the callback and store the result.
   *
   * This is the "remember" pattern from Laravel — the most common
   * caching pattern. On cache hit, returns the cached value. On miss,
   * executes the callback, stores the result, and returns it.
   *
   * @param key - Cache key
   * @param ttl - TTL in seconds
   * @param callback - Function to execute on cache miss
   * @returns The cached or freshly computed value
   *
   * @example
   * ```typescript
   * const user = await cache.remember('user:123', 3600, async () => {
   *   return await db.users.findById(123);
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
   * Get an item, or execute the callback and store the result forever.
   *
   * Like `remember()`, but the result never expires.
   *
   * @param key - Cache key
   * @param callback - Function to execute on cache miss
   * @returns The cached or freshly computed value
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

  // ──────────────────────────────────────────────────────────────────────────
  // Delete Operations
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Retrieve an item and delete it from the cache.
   *
   * @param key - Cache key
   * @param defaultValue - Returned if the key doesn't exist
   * @returns The cached value (now removed), or the default
   */
  async pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.get<T>(key, defaultValue);
    await this.forget(key);

    return value;
  }

  /**
   * Remove an item from the cache.
   *
   * @param key - Cache key
   * @returns True if the item was removed
   */
  async forget(key: string): Promise<boolean> {
    return this.store.forget(key);
  }

  /**
   * Remove all items from the cache.
   *
   * @returns True if successful
   */
  async flush(): Promise<boolean> {
    return this.store.flush();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Tagging (Redis only)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Begin a tagged cache operation.
   *
   * Only available when the underlying store supports tagging (e.g., Redis).
   * Throws if the store doesn't implement the TaggableStore interface.
   *
   * @param names - Array of tag names
   * @returns A TaggedCache instance scoped to the given tags
   * @throws Error if the store doesn't support tagging
   */
  async tags(names: string[]): Promise<TaggedCache> {
    if (!this.isTaggableStore(this.store)) {
      throw new Error(
        `Cache store [${this.store.constructor.name}] does not support tagging. ` +
          'Only the Redis store supports cache tagging.'
      );
    }

    return this.store.tags(names);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Accessors
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get the cache key prefix from the underlying store.
   *
   * @returns The prefix string
   */
  getPrefix(): string {
    return this.store.getPrefix();
  }

  /**
   * Get the underlying Store instance.
   *
   * Useful for advanced operations or type-narrowing.
   *
   * @returns The raw Store
   */
  getStore(): Store {
    return this.store;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Type guard: check if a store supports tagging.
   *
   * @param s - The store to check
   * @returns True if the store has a `tags` method
   */
  private isTaggableStore(s: Store): s is TaggableStore {
    return 'tags' in s && typeof (s as any).tags === 'function';
  }
}
