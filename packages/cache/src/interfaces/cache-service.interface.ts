/**
 * Cache Service Interface
 *
 * Defines the contract for cache service implementations.
 * All methods return Promises for consistency.
 */
export interface CacheServiceInterface {
  /**
   * Get a cache store by name
   *
   * @param name - Store name (uses default if not specified)
   * @returns Cache service instance for the specified store
   */
  store(name?: string): any; // Returns CacheService

  /**
   * Get the default store name
   *
   * @returns Default store name
   */
  getDefaultStoreName(): string;

  /**
   * Get all configured store names
   *
   * @returns Array of store names
   */
  getStoreNames(): string[];

  /**
   * Check if a store exists
   *
   * @param name - Store name
   * @returns True if store exists
   */
  hasStore(name: string): boolean;

  /**
   * Get the cache key prefix
   *
   * @returns Cache key prefix
   */
  getPrefix(): string;

  /**
   * Check if a key exists in cache
   */
  has(key: string): Promise<boolean>;

  /**
   * Get a value from cache
   */
  get<T = any>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Get multiple values from cache
   */
  many<T = any>(keys: string[]): Promise<Record<string, T>>;

  /**
   * Store a value in cache
   */
  put<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Store multiple values in cache
   */
  putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean>;

  /**
   * Store a value only if it doesn't exist
   */
  add<T = any>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Get value or execute callback and store result
   */
  remember<T = any>(
    key: string,
    ttl: number,
    callback: () => T | Promise<T>,
  ): Promise<T>;

  /**
   * Get value or execute callback and store result forever
   */
  rememberForever<T = any>(
    key: string,
    callback: () => T | Promise<T>,
  ): Promise<T>;

  /**
   * Increment a numeric value
   */
  increment(key: string, value?: number): Promise<number>;

  /**
   * Decrement a numeric value
   */
  decrement(key: string, value?: number): Promise<number>;

  /**
   * Store a value forever (no expiration)
   */
  forever<T = any>(key: string, value: T): Promise<boolean>;

  /**
   * Get and remove a value from cache
   */
  pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Remove a value from cache
   */
  forget(key: string): Promise<boolean>;

  /**
   * Clear all values from cache
   */
  flush(): Promise<boolean>;

  /**
   * Get tagged cache instance (Redis only)
   */
  tags(names: string[]): any; // Returns TaggedCache
}
