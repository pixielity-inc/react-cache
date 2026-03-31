/**
 * Memory store configuration
 * 
 * Configuration specific to the in-memory cache store.
 * 
 * @module interfaces/memory-store-config
 * 
 * @example
 * ```typescript
 * const config: MemoryStoreConfig = {
 *   driver: 'memory',
 *   maxSize: 1000,
 *   ttl: 300,
 *   prefix: 'mem_',
 * };
 * ```
 */

export interface MemoryStoreConfig {
  driver: 'memory';

  /**
   * Store-specific key prefix
   * 
   * Optional prefix for this store only (in addition to global prefix).
   * 
   * @default ''
   * @example 'cache_' results in keys like 'myapp_cache_user:123'
   */
  prefix?: string;

  /**
   * Default time-to-live in seconds
   * 
   * Used when no TTL is specified in cache operations.
   * 
   * @default 300 (5 minutes)
   */
  ttl?: number;

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
}
