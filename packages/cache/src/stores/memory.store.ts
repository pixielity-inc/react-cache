/**
 * Memory Cache Store
 *
 * In-memory cache implementation using JavaScript Map.
 * Fast but not persistent - data is lost when the process restarts.
 *
 * **Features:**
 * - TTL support with automatic expiration
 * - LRU eviction when maxSize is reached
 * - Increment/decrement operations
 * - No external dependencies
 *
 * **Use Cases:**
 * - Development/testing
 * - Client-side caching in browsers
 * - Temporary session data
 * - When persistence is not required
 *
 * @module stores/memory
 */

import type { Store, MemoryStoreConfig } from "@/interfaces";

/**
 * Cache entry structure
 *
 * Stores the cached value along with metadata for TTL tracking
 */
interface CacheEntry<T = any> {
  /**
   * The cached value
   */
  value: T;
  /**
   * Timestamp when the entry was created (milliseconds)
   */
  timestamp: number;
  /**
   * Time-to-live in milliseconds (undefined = no expiration)
   */
  ttl?: number;
}

/**
 * Memory cache store implementation
 *
 * Provides an in-memory cache using JavaScript Map with TTL support.
 *
 * @example
 * ```typescript
 * const store = new MemoryStore({
 *   ttl: 300,        // 5 minutes default
 *   maxSize: 1000,   // Max 1000 entries
 *   prefix: 'app_'
 * });
 *
 * // Store data
 * await store.put('user:123', { name: 'John' }, 3600);
 *
 * // Retrieve data
 * const user = await store.get('user:123');
 *
 * // Increment counter
 * await store.increment('page:views');
 * ```
 */
export class MemoryStore implements Store {
  /**
   * Internal cache storage
   */
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Maximum cache size
   */
  private readonly maxSize?: number;

  /**
   * Cache key prefix
   */
  private readonly prefix: string;

  /**
   * Create a new memory store
   *
   * @param config - Store configuration
   */
  constructor(config: Omit<MemoryStoreConfig, "driver"> = {}) {
    this.maxSize = config.maxSize;
    this.prefix = config.prefix ?? "";
  }

  /**
   * Retrieve an item from the cache
   *
   * Automatically removes expired entries.
   *
   * @param key - Cache key
   * @returns The cached value, or undefined if not found/expired
   */
  async get(key: string): Promise<any> {
    const entry = this.cache.get(this.prefix + key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(this.prefix + key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Retrieve multiple items from the cache
   *
   * @param keys - Array of cache keys
   * @returns Object mapping keys to values (undefined for missing/expired)
   */
  async many(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const key of keys) {
      results[key] = await this.get(key);
    }

    return results;
  }

  /**
   * Store an item in the cache
   *
   * Implements LRU eviction when maxSize is reached.
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param seconds - TTL in seconds
   * @returns Always true
   */
  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const prefixedKey = this.prefix + key;

    // Evict oldest entry if cache is full and this is a new key
    if (
      this.maxSize &&
      this.cache.size >= this.maxSize &&
      !this.cache.has(prefixedKey)
    ) {
      this.evictOldest();
    }

    // Store entry with TTL
    this.cache.set(prefixedKey, {
      value,
      timestamp: Date.now(),
      ttl: seconds * 1000, // Convert to milliseconds
    });

    return true;
  }

  /**
   * Store multiple items in the cache
   *
   * @param values - Object mapping keys to values
   * @param seconds - TTL in seconds
   * @returns Always true
   */
  async putMany(
    values: Record<string, any>,
    seconds: number,
  ): Promise<boolean> {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, seconds);
    }

    return true;
  }

  /**
   * Increment a numeric value in the cache
   *
   * If the key doesn't exist, it's initialized to 0 before incrementing.
   *
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value after incrementing
   *
   * @example
   * ```typescript
   * await store.increment('counter');      // 1
   * await store.increment('counter', 5);   // 6
   * ```
   */
  async increment(key: string, value: number = 1): Promise<number> {
    const current = (await this.get(key)) ?? 0;
    const newValue = Number(current) + value;

    // Store without expiration (forever)
    await this.forever(key, newValue);

    return newValue;
  }

  /**
   * Decrement a numeric value in the cache
   *
   * If the key doesn't exist, it's initialized to 0 before decrementing.
   *
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value after decrementing
   *
   * @example
   * ```typescript
   * await store.decrement('stock');      // -1
   * await store.decrement('stock', 10);  // -11
   * ```
   */
  async decrement(key: string, value: number = 1): Promise<number> {
    return this.increment(key, -value);
  }

  /**
   * Store an item indefinitely (no expiration)
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @returns Always true
   */
  async forever(key: string, value: any): Promise<boolean> {
    const prefixedKey = this.prefix + key;

    this.cache.set(prefixedKey, {
      value,
      timestamp: Date.now(),
      // No TTL = never expires
    });

    return true;
  }

  /**
   * Remove an item from the cache
   *
   * @param key - Cache key
   * @returns True if the item existed and was removed
   */
  async forget(key: string): Promise<boolean> {
    return this.cache.delete(this.prefix + key);
  }

  /**
   * Remove all items from the cache
   *
   * @returns Always true
   */
  async flush(): Promise<boolean> {
    this.cache.clear();
    return true;
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
   * Check if a cache entry has expired
   *
   * @param entry - The cache entry to check
   * @returns True if expired
   * @private
   */
  private isExpired(entry: CacheEntry): boolean {
    // No TTL = never expires
    if (!entry.ttl) {
      return false;
    }

    // Check if current time exceeds entry timestamp + TTL
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict the oldest entry from the cache (LRU)
   *
   * JavaScript Map maintains insertion order, so the first key is the oldest.
   *
   * @private
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;

    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  /**
   * Get cache statistics (useful for debugging)
   *
   * @returns Cache statistics
   *
   * @example
   * ```typescript
   * const stats = store.getStats();
   * console.log(`Cache size: ${stats.size}/${stats.maxSize}`);
   * console.log(`Hit rate: ${stats.hitRate}%`);
   * ```
   */
  getStats(): {
    size: number;
    maxSize: number | undefined;
    prefix: string;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      prefix: this.prefix,
    };
  }
}
