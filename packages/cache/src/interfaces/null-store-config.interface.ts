/**
 * Null store configuration
 * 
 * Configuration for the no-op cache store.
 * Useful for testing or temporarily disabling cache.
 * 
 * @module types/null-store-config
 * 
 * @example
 * ```typescript
 * const config: NullStoreConfig = {
 *   driver: 'null',
 * };
 * ```
 */

export interface NullStoreConfig {
  driver: 'null';

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
}
