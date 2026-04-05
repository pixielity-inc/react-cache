/**
 * Redis store configuration
 *
 * Configuration specific to the Redis-backed cache store.
 * The `connection` field is a string name that gets resolved at runtime
 * by a Redis factory (like Laravel's `$app['redis']`).
 *
 * @module interfaces/redis-store-config
 *
 * @example
 * ```typescript
 * const config: RedisStoreConfig = {
 *   driver: 'redis',
 *   connection: 'cache',
 *   prefix: 'cache_',
 *   ttl: 3600,
 * };
 * ```
 */

export interface RedisStoreConfig {
  driver: 'redis';

  /**
   * Redis connection name
   *
   * A string identifier resolved at runtime by the Redis factory
   * registered in the DI container (e.g., from @abdokouta/react-redis).
   *
   * @default 'default'
   * @example 'cache' | 'session' | 'default'
   */
  connection: string;

  /**
   * Store-specific key prefix
   *
   * @default ''
   */
  prefix?: string;

  /**
   * Default time-to-live in seconds
   *
   * @default 300
   */
  ttl?: number;
}
