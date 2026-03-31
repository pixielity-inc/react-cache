/**
 * Null Cache Store
 * 
 * No-op cache implementation that doesn't actually store anything.
 * All operations succeed but no data is cached.
 * 
 * **Use Cases:**
 * - Disabling cache in testing
 * - Development environments
 * - Feature flags to disable caching
 * - Benchmarking without cache overhead
 * 
 * @module stores/null
 */

import type { Store, NullStoreConfig } from '@/interfaces';

/**
 * Null cache store implementation
 * 
 * A cache store that doesn't cache anything. All get operations return undefined,
 * and all write operations succeed without doing anything.
 * 
 * This is useful for:
 * - Testing code without cache side effects
 * - Temporarily disabling cache
 * - Measuring performance without caching
 * 
 * @example
 * ```typescript
 * const store = new NullStore();
 * 
 * await store.put('key', 'value', 3600); // Does nothing
 * const value = await store.get('key');  // Returns undefined
 * 
 * // Useful for conditional caching
 * const cacheStore = process.env.CACHE_ENABLED === 'true'
 *   ? new RedisStore(config)
 *   : new NullStore();
 * ```
 */
export class NullStore implements Store {
  /** 
   * Cache key prefix (not used) 
   */
  private readonly prefix: string;

  /**
   * Create a new null store
   * 
   * @param config - Store configuration
   */
  constructor(config: Omit<NullStoreConfig, 'driver'> = {}) {
    this.prefix = config.prefix ?? '';
  }

  /**
   * Retrieve an item from the cache
   * 
   * Always returns undefined since nothing is cached.
   * 
   * @param _key - Cache key (ignored)
   * @returns Always undefined
   */
  async get(_key: string): Promise<any> {
    return undefined;
  }

  /**
   * Retrieve multiple items from the cache
   * 
   * Always returns an object with all values as undefined.
   * 
   * @param keys - Array of cache keys
   * @returns Object mapping keys to undefined
   */
  async many(keys: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const key of keys) {
      results[key] = undefined;
    }
    
    return results;
  }

  /**
   * Store an item in the cache
   * 
   * Does nothing but returns true to indicate "success".
   * 
   * @param _key - Cache key (ignored)
   * @param _value - Value to cache (ignored)
   * @param _seconds - TTL in seconds (ignored)
   * @returns Always true
   */
  async put(_key: string, _value: any, _seconds: number): Promise<boolean> {
    return true;
  }

  /**
   * Store multiple items in the cache
   * 
   * Does nothing but returns true to indicate "success".
   * 
   * @param _values - Object mapping keys to values (ignored)
   * @param _seconds - TTL in seconds (ignored)
   * @returns Always true
   */
  async putMany(_values: Record<string, any>, _seconds: number): Promise<boolean> {
    return true;
  }

  /**
   * Increment a numeric value in the cache
   * 
   * Returns false since no actual increment occurs.
   * 
   * @param _key - Cache key (ignored)
   * @param _value - Amount to increment by (ignored)
   * @returns Always false
   */
  async increment(_key: string, _value?: number): Promise<number | boolean> {
    return false;
  }

  /**
   * Decrement a numeric value in the cache
   * 
   * Returns false since no actual decrement occurs.
   * 
   * @param _key - Cache key (ignored)
   * @param _value - Amount to decrement by (ignored)
   * @returns Always false
   */
  async decrement(_key: string, _value?: number): Promise<number | boolean> {
    return false;
  }

  /**
   * Store an item indefinitely
   * 
   * Does nothing but returns true to indicate "success".
   * 
   * @param _key - Cache key (ignored)
   * @param _value - Value to cache (ignored)
   * @returns Always true
   */
  async forever(_key: string, _value: any): Promise<boolean> {
    return true;
  }

  /**
   * Remove an item from the cache
   * 
   * Does nothing but returns true to indicate "success".
   * 
   * @param _key - Cache key (ignored)
   * @returns Always true
   */
  async forget(_key: string): Promise<boolean> {
    return true;
  }

  /**
   * Remove all items from the cache
   * 
   * Does nothing but returns true to indicate "success".
   * 
   * @returns Always true
   */
  async flush(): Promise<boolean> {
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
}
