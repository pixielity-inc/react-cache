/**
 * Memory Store Configuration Interface
 *
 * Configuration options for the in-memory cache store.
 *
 * @module stores/memory-store-config
 */

/**
 * Memory store configuration
 *
 * Defines configuration options specific to the in-memory cache store.
 *
 * @example
 * ```typescript
 * const config: MemoryStoreConfig = {
 *   maxSize: 1000,
 *   ttl: 300,
 *   prefix: 'app_'
 * };
 * ```
 */
export interface MemoryStoreConfig {
  /**
   * Maximum number of items to store
   *
   * When the limit is reached, the oldest items are evicted (LRU-style).
   * Set to undefined for unlimited size (use with caution).
   *
   * @default undefined (unlimited)
   * @example 1000
   */
  maxSize?: number;

  /**
   * Default time-to-live in seconds
   *
   * Used when no TTL is specified in cache operations.
   *
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Cache key prefix
   *
   * Prepended to all cache keys to avoid collisions.
   *
   * @default ''
   * @example 'app_' results in keys like 'app_user:123'
   */
  prefix?: string;
}
