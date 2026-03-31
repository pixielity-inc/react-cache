/**
 * Redis store configuration
 *
 * Configuration specific to the Redis-backed cache store.
 * Requires @abdokouta/redis package to be installed.
 *
 * @module interfaces/redis-store-config
 *
 * @example
 * ```typescript
 * const redis = await redisManager.connection('cache');
 * const config: RedisStoreConfig = {
 *   driver: 'redis',
 *   connection: redis,
 *   prefix: 'cache_',
 *   ttl: 3600,
 * };
 * ```
 */

import type { RedisConnection } from './redis-connection.interface';

export interface RedisStoreConfig {
  driver: 'redis';

  /**
   * Redis connection instance
   *
   * Must be a connected Redis client from @abdokouta/redis.
   */
  connection: RedisConnection;

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
