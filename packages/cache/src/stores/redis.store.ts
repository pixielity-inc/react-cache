/**
 * Redis Cache Store
 *
 * Redis-backed cache implementation with support for tagging.
 * Uses @abdokouta/redis (Upstash) for browser-compatible Redis access.
 *
 * **Features:**
 * - Persistent caching across application restarts
 * - Cache tagging support
 * - Atomic increment/decrement operations
 * - TTL support at the Redis level
 * - Distributed caching (multiple servers can share cache)
 *
 * **Use Cases:**
 * - Production applications
 * - Distributed systems
 * - When cache persistence is required
 * - When cache tagging is needed
 *
 * @module stores/redis
 */

import type { TaggableStore, TaggedCache, RedisStoreConfig, RedisConnection } from '@/interfaces';
import { RedisTagSet } from '@/tags/redis-tag-set';
import { TaggedCache as TaggedCacheImpl } from '@/tags/tagged-cache';

/**
 * Redis cache store implementation
 *
 * Provides a Redis-backed cache with tagging support.
 *
 * @example
 * ```typescript
 * const redis = await redisManager.connection('cache');
 * const store = new RedisStore({
 *   connection: redis,
 *   prefix: 'app_',
 *   ttl: 3600
 * });
 *
 * // Basic caching
 * await store.put('user:123', { name: 'John' }, 3600);
 * const user = await store.get('user:123');
 *
 * // Tagged caching
 * const taggedCache = store.tags(['users', 'premium']);
 * await taggedCache.put('user:456', { name: 'Jane' }, 3600);
 * await taggedCache.flush(); // Flush all premium users
 * ```
 */
export class RedisStore implements TaggableStore {
  /**
   * Redis connection
   */
  private readonly redis: RedisConnection;

  /**
   * Cache key prefix
   */
  private readonly prefix: string;

  /**
   * Create a new Redis store
   *
   * @param config - Store configuration
   */
  constructor(config: RedisStoreConfig) {
    this.redis = config.connection;
    this.prefix = config.prefix ?? '';
  }

  /**
   * Retrieve an item from the cache
   *
   * @param key - Cache key
   * @returns The cached value, or undefined if not found
   *
   * @example
   * ```typescript
   * const user = await store.get('user:123');
   * ```
   */
  async get(key: string): Promise<any> {
    const value = await this.redis.get(this.prefix + key);

    if (value === null) {
      return undefined;
    }

    return this.deserialize(value);
  }

  /**
   * Retrieve multiple items from the cache
   *
   * @param keys - Array of cache keys
   * @returns Object mapping keys to values
   *
   * @example
   * ```typescript
   * const data = await store.many(['user:1', 'user:2', 'user:3']);
   * ```
   */
  async many(keys: string[]): Promise<Record<string, any>> {
    if (keys.length === 0) {
      return {};
    }

    const prefixedKeys = keys.map((key) => this.prefix + key);
    const values = await this.redis.mget(...prefixedKeys);

    const results: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key !== undefined) {
        results[key] = values[i] !== null ? this.deserialize(values[i]!) : undefined;
      }
    }

    return results;
  }

  /**
   * Store an item in the cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param seconds - TTL in seconds
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await store.put('user:123', { name: 'John' }, 3600);
   * ```
   */
  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const serialized = this.serialize(value);
    const result = await this.redis.set(this.prefix + key, serialized, { ex: seconds });

    return result === 'OK';
  }

  /**
   * Store multiple items in the cache
   *
   * Note: Redis MSET doesn't support TTL, so we set TTL separately for each key.
   *
   * @param values - Object mapping keys to values
   * @param seconds - TTL in seconds
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await store.putMany({
   *   'user:1': user1,
   *   'user:2': user2
   * }, 3600);
   * ```
   */
  async putMany(values: Record<string, any>, seconds: number): Promise<boolean> {
    if (Object.keys(values).length === 0) {
      return true;
    }

    // Store all values (we'll set TTL separately)
    const serializedValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      serializedValues[this.prefix + key] = this.serialize(value);
    }

    await this.redis.mset(serializedValues);

    // Set TTL for each key (Redis doesn't support TTL in MSET)
    await Promise.all(
      Object.keys(values).map((key) => {
        const serializedValue = serializedValues[this.prefix + key];
        if (serializedValue !== undefined) {
          return this.redis.set(this.prefix + key, serializedValue, { ex: seconds });
        }
        return Promise.resolve();
      })
    );

    return true;
  }

  /**
   * Increment a numeric value in the cache
   *
   * Uses Redis INCRBY for atomic operations.
   *
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing
   *
   * @example
   * ```typescript
   * await store.increment('page:views');      // 1
   * await store.increment('page:views', 10);  // 11
   * ```
   */
  async increment(key: string, value: number = 1): Promise<number> {
    if (value === 1) {
      return this.redis.incr(this.prefix + key);
    }

    return this.redis.incrby(this.prefix + key, value);
  }

  /**
   * Decrement a numeric value in the cache
   *
   * Uses Redis DECRBY for atomic operations.
   *
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing
   *
   * @example
   * ```typescript
   * await store.decrement('stock:product:123');     // -1
   * await store.decrement('stock:product:123', 5);  // -6
   * ```
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    if (value === 1) {
      return this.redis.decr(this.prefix + key);
    }

    return this.redis.decrby(this.prefix + key, value);
  }

  /**
   * Store an item indefinitely
   *
   * Note: Redis doesn't have true "forever" storage, so we use a very long TTL (10 years).
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await store.forever('config:app', { theme: 'dark' });
   * ```
   */
  async forever(key: string, value: any): Promise<boolean> {
    const serialized = this.serialize(value);
    // Use 10 years as "forever"
    const result = await this.redis.set(this.prefix + key, serialized, { ex: 315360000 });

    return result === 'OK';
  }

  /**
   * Remove an item from the cache
   *
   * @param key - Cache key
   * @returns True if the item was removed
   *
   * @example
   * ```typescript
   * await store.forget('user:123');
   * ```
   */
  async forget(key: string): Promise<boolean> {
    const result = await this.redis.del(this.prefix + key);
    return result > 0;
  }

  /**
   * Remove all items from the cache
   *
   * **Warning:** This flushes the entire Redis database, not just prefixed keys.
   * Use with caution in shared Redis instances.
   *
   * @returns True if successful
   *
   * @example
   * ```typescript
   * await store.flush(); // Clears entire Redis database
   * ```
   */
  async flush(): Promise<boolean> {
    const result = await this.redis.flushdb();
    return result === 'OK';
  }

  /**
   * Get the cache key prefix
   *
   * @returns The prefix string
   */
  getPrefix(): string {
    return this.prefix;
  }

  /**
   * Begin executing a new tags operation
   *
   * Creates a TaggedCache instance for cache operations scoped to specific tags.
   *
   * @param names - Array of tag names
   * @returns A TaggedCache instance
   *
   * @example
   * ```typescript
   * const taggedCache = store.tags(['users', 'premium']);
   * await taggedCache.put('user:123', user, 3600);
   * await taggedCache.flush(); // Flush all premium users
   * ```
   */
  tags(names: string[]): TaggedCache {
    const tagSet = new RedisTagSet(this.redis, names);
    return new TaggedCacheImpl(this, tagSet);
  }

  /**
   * Serialize a value for storage in Redis
   *
   * Converts JavaScript values to JSON strings.
   *
   * @param value - Value to serialize
   * @returns JSON string
   * @private
   */
  private serialize(value: any): string {
    return JSON.stringify(value);
  }

  /**
   * Deserialize a value from Redis
   *
   * Converts JSON strings back to JavaScript values.
   *
   * @param value - JSON string
   * @returns Deserialized value
   * @private
   */
  private deserialize(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      // If parsing fails, return the raw string
      return value;
    }
  }
}
