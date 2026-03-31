/**
 * Tagged cache interface
 * 
 * Provides cache operations scoped to specific tags.
 * All cache keys are automatically prefixed with tag namespaces.
 * 
 * @module interfaces/tagged-cache
 * 
 * @example
 * ```typescript
 * const taggedCache = cache.tags(['users', 'premium']);
 * 
 * // Store with tags
 * await taggedCache.put('user:123', user, 3600);
 * 
 * // Flush all items with these tags
 * await taggedCache.flush();
 * ```
 */

import type { TagSet } from './tag-set.interface';

export interface TaggedCache {
  /**
   * Get the tag set for this tagged cache
   * 
   * @returns The TagSet instance
   */
  getTags(): TagSet;

  /**
   * Retrieve an item from the cache
   * 
   * @param key - Cache key (will be prefixed with tag namespace)
   * @returns The cached value, or undefined if not found
   */
  get<T = any>(key: string): Promise<T | undefined>;

  /**
   * Retrieve multiple items from the cache
   * 
   * @param keys - Array of cache keys
   * @returns Object mapping keys to values
   */
  many(keys: string[]): Promise<Record<string, any>>;

  /**
   * Store an item in the cache
   * 
   * @param key - Cache key (will be prefixed with tag namespace)
   * @param value - Value to cache
   * @param ttl - TTL in seconds
   * @returns True if successful
   */
  put(key: string, value: any, ttl?: number): Promise<boolean>;

  /**
   * Store multiple items in the cache
   * 
   * @param values - Object mapping keys to values
   * @param ttl - TTL in seconds
   * @returns True if successful
   */
  putMany(values: Record<string, any>, ttl?: number): Promise<boolean>;

  /**
   * Increment a numeric value in the cache
   * 
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value, or false on failure
   */
  increment(key: string, value?: number): Promise<number | boolean>;

  /**
   * Decrement a numeric value in the cache
   * 
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value, or false on failure
   */
  decrement(key: string, value?: number): Promise<number | boolean>;

  /**
   * Store an item indefinitely
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @returns True if successful
   */
  forever(key: string, value: any): Promise<boolean>;

  /**
   * Remove an item from the cache
   * 
   * @param key - Cache key
   * @returns True if the item was removed
   */
  forget(key: string): Promise<boolean>;

  /**
   * Remove all items with these tags
   * 
   * This resets the tag namespaces, making all tagged cache keys inaccessible.
   * 
   * @returns True if successful
   */
  flush(): Promise<boolean>;
}
