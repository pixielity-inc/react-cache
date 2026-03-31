/**
 * Base cache store interface
 *
 * Defines the contract that all cache stores must implement.
 * Provides basic cache operations like get, put, forget, etc.
 *
 * @module types/store
 *
 * @example
 * ```typescript
 * class MyCustomStore implements Store {
 *   async get(key: string): Promise<any> {
 *     // Implementation
 *   }
 *
 *   async put(key: string, value: any, seconds: number): Promise<boolean> {
 *     // Implementation
 *   }
 *
 *   // ... other methods
 * }
 * ```
 */

export interface Store {
  /**
   * Retrieve an item from the cache by key
   *
   * @param key - Cache key
   * @returns The cached value, or undefined if not found
   */
  get(key: string): Promise<any>;

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
   * @param key - Cache key
   * @param value - Value to cache
   * @param seconds - TTL in seconds
   * @returns True if successful
   */
  put(key: string, value: any, seconds: number): Promise<boolean>;

  /**
   * Store multiple items in the cache
   *
   * @param values - Object mapping keys to values
   * @param seconds - TTL in seconds
   * @returns True if successful
   */
  putMany(values: Record<string, any>, seconds: number): Promise<boolean>;

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
   * Remove all items from the cache
   *
   * @returns True if successful
   */
  flush(): Promise<boolean>;

  /**
   * Get the cache key prefix
   *
   * @returns The prefix string
   */
  getPrefix(): string;
}
