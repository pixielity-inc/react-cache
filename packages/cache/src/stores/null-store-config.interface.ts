/**
 * Null Store Configuration Interface
 *
 * Configuration options for the null cache store.
 *
 * @module stores/null-store-config
 */

/**
 * Null store configuration
 *
 * Defines configuration options for the null cache store.
 * Since the null store doesn't actually cache anything, most options are ignored.
 *
 * @example
 * ```typescript
 * const config: NullStoreConfig = {
 *   prefix: 'app_'
 * };
 * ```
 */
export interface NullStoreConfig {
  /**
   * Cache key prefix
   *
   * Not actually used by the null store, but included for consistency.
   *
   * @default ''
   */
  prefix?: string;

  /**
   * Default time-to-live in seconds
   *
   * Not actually used by the null store, but included for consistency.
   *
   * @default 300 (5 minutes)
   */
  ttl?: number;
}
