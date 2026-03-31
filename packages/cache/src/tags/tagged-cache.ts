/**
 * Tagged Cache Implementation
 * 
 * Provides cache operations scoped to specific tags.
 * This wraps a Store and prefixes all keys with tag namespaces.
 * 
 * **How it works:**
 * 1. Get tag namespace (e.g., "abc123|def456")
 * 2. Prefix cache key with namespace
 * 3. Perform cache operation on prefixed key
 * 4. Track TTL in tag set (Redis only)
 * 
 * When tags are flushed, their namespaces change,
 * making all old cache keys inaccessible.
 * 
 * @module tags/tagged-cache
 */

import type { TaggedCache as ITaggedCache, TagSet, Store } from '@/interfaces';

/**
 * Tagged cache implementation
 * 
 * Wraps a cache store to provide tag-scoped operations.
 * 
 * @example
 * ```typescript
 * const tagSet = new RedisTagSet(redis, ['users', 'premium']);
 * const taggedCache = new TaggedCache(store, tagSet);
 * 
 * // Store with tags
 * await taggedCache.put('user:123', user, 3600);
 * // Actual key: "abc123|def456:user:123"
 * 
 * // Retrieve with tags
 * const user = await taggedCache.get('user:123');
 * 
 * // Flush tags (regenerates namespaces)
 * await taggedCache.flush();
 * // Now 'user:123' is inaccessible (namespace changed)
 * ```
 */
export class TaggedCache implements ITaggedCache {
  /** 
 * The underlying cache store 
 */
  private readonly store: Store;
  
  /** 
 * Tag set managing namespaces 
 */
  private readonly tagSet: TagSet;

  /**
   * Create a new tagged cache
   * 
   * @param store - The cache store to wrap
   * @param tagSet - Tag set managing namespaces
   */
  constructor(store: Store, tagSet: TagSet) {
    this.store = store;
    this.tagSet = tagSet;
  }

  /**
   * Retrieve an item from the tagged cache
   * 
   * @param key - Cache key (will be prefixed with tag namespace)
   * @returns The cached value, or undefined if not found
   * 
   * @example
   * ```typescript
   * const user = await taggedCache.get('user:123');
   * ```
   */
  async get(key: string): Promise<any> {
    const namespacedKey = await this.getNamespacedKey(key);
    return this.store.get(namespacedKey);
  }

  /**
   * Retrieve multiple items from the tagged cache
   * 
   * @param keys - Array of cache keys
   * @returns Object mapping original keys to values
   * 
   * @example
   * ```typescript
   * const users = await taggedCache.many(['user:1', 'user:2']);
   * // { 'user:1': {...}, 'user:2': {...} }
   * ```
   */
  async many(keys: string[]): Promise<Record<string, any>> {
    const namespace = await this.tagSet.getNamespace();
    const namespacedKeys = keys.map(key => `${namespace}:${key}`);
    
    const results = await this.store.many(namespacedKeys);
    
    // Map back to original keys
    const mappedResults: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const namespacedKey = namespacedKeys[i];
      if (key !== undefined && namespacedKey !== undefined) {
        mappedResults[key] = results[namespacedKey];
      }
    }
    
    return mappedResults;
  }

  /**
   * Store an item in the tagged cache
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param seconds - TTL in seconds
   * @returns True if successful
   * 
   * @example
   * ```typescript
   * await taggedCache.put('user:123', { name: 'John' }, 3600);
   * ```
   */
  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const namespacedKey = await this.getNamespacedKey(key);
    
    // Track TTL in tag set (if supported)
    if (this.tagSet.addEntry) {
      await this.tagSet.addEntry(key, seconds);
    }
    
    return this.store.put(namespacedKey, value, seconds);
  }

  /**
   * Store multiple items in the tagged cache
   * 
   * @param values - Object mapping keys to values
   * @param seconds - TTL in seconds
   * @returns True if successful
   * 
   * @example
   * ```typescript
   * await taggedCache.putMany({
   *   'user:1': user1,
   *   'user:2': user2
   * }, 3600);
   * ```
   */
  async putMany(values: Record<string, any>, seconds: number): Promise<boolean> {
    const namespace = await this.tagSet.getNamespace();
    
    // Namespace all keys
    const namespacedValues: Record<string, any> = {};
    for (const [key, value] of Object.entries(values)) {
      namespacedValues[`${namespace}:${key}`] = value;
      
      // Track TTL in tag set (if supported)
      if (this.tagSet.addEntry) {
        await this.tagSet.addEntry(key, seconds);
      }
    }
    
    return this.store.putMany(namespacedValues, seconds);
  }

  /**
   * Increment a tagged cache value
   * 
   * @param key - Cache key
   * @param value - Amount to increment by (default: 1)
   * @returns The new value, or false on failure
   * 
   * @example
   * ```typescript
   * await taggedCache.increment('views:post:123');
   * ```
   */
  async increment(key: string, value: number = 1): Promise<number | boolean> {
    const namespacedKey = await this.getNamespacedKey(key);
    return this.store.increment(namespacedKey, value);
  }

  /**
   * Decrement a tagged cache value
   * 
   * @param key - Cache key
   * @param value - Amount to decrement by (default: 1)
   * @returns The new value, or false on failure
   * 
   * @example
   * ```typescript
   * await taggedCache.decrement('stock:product:456');
   * ```
   */
  async decrement(key: string, value: number = 1): Promise<number | boolean> {
    const namespacedKey = await this.getNamespacedKey(key);
    return this.store.decrement(namespacedKey, value);
  }

  /**
   * Store an item indefinitely in the tagged cache
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @returns True if successful
   * 
   * @example
   * ```typescript
   * await taggedCache.forever('config:theme', { mode: 'dark' });
   * ```
   */
  async forever(key: string, value: any): Promise<boolean> {
    const namespacedKey = await this.getNamespacedKey(key);
    return this.store.forever(namespacedKey, value);
  }

  /**
   * Remove an item from the tagged cache
   * 
   * @param key - Cache key
   * @returns True if removed
   * 
   * @example
   * ```typescript
   * await taggedCache.forget('user:123');
   * ```
   */
  async forget(key: string): Promise<boolean> {
    const namespacedKey = await this.getNamespacedKey(key);
    return this.store.forget(namespacedKey);
  }

  /**
   * Flush all items with these tags
   * 
   * This works by resetting the tag namespaces,
   * making all old cache keys inaccessible.
   * 
   * @returns True if successful
   * 
   * @example
   * ```typescript
   * // Flush all premium users
   * await cache.tags(['users', 'premium']).flush();
   * ```
   */
  async flush(): Promise<boolean> {
    await this.tagSet.reset();
    return true;
  }

  /**
   * Get the tag set
   * 
   * @returns The TagSet instance
   */
  getTags(): TagSet {
    return this.tagSet;
  }

  /**
   * Get a fully qualified key for the tagged cache
   * 
   * Combines the tag namespace with the key to create a unique cache key.
   * 
   * @param key - The base cache key
   * @returns Promise resolving to the fully qualified key
   * 
   * @example
   * ```typescript
   * const fullKey = await taggedCache.taggedItemKey('user:123');
   * // "abc123|def456:user:123"
   * ```
   */
  async taggedItemKey(key: string): Promise<string> {
    return this.getNamespacedKey(key);
  }

  /**
   * Get a cache key prefixed with tag namespace
   * 
   * @param key - Original cache key
   * @returns Namespaced key (e.g., "abc123|def456:user:123")
   * @private
   */
  private async getNamespacedKey(key: string): Promise<string> {
    const namespace = await this.tagSet.getNamespace();
    return `${namespace}:${key}`;
  }
}
