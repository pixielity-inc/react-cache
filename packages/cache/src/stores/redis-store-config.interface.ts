/**
 * Redis Store Configuration Interface
 * 
 * Configuration options for the Redis cache store.
 * 
 * @module stores/redis-store-config
 */

/**
 * Redis connection interface
 * 
 * Minimal interface for Redis operations required by the cache store.
 * This matches the RedisConnection interface from @pixielity/redis.
 */
export interface RedisConnection {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
  mget(...keys: string[]): Promise<(string | null)[]>;
  mset(data: Record<string, string>): Promise<'OK'>;
  incr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  decr(key: string): Promise<number>;
  decrby(key: string, decrement: number): Promise<number>;
  flushdb(): Promise<'OK'>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
}

/**
 * Redis store configuration
 * 
 * Defines configuration options specific to the Redis cache store.
 * 
 * @example
 * ```typescript
 * const redis = await redisManager.connection('cache');
 * const config: RedisStoreConfig = {
 *   connection: redis,
 *   prefix: 'cache_',
 *   ttl: 3600
 * };
 * ```
 */
export interface RedisStoreConfig {
  /**
   * Redis connection instance
   * 
   * Must be a connected Redis client from @pixielity/redis.
   */
  connection: RedisConnection;

  /**
   * Cache key prefix
   * 
   * Prepended to all cache keys to avoid collisions.
   * 
   * @default ''
   * @example 'cache_' results in keys like 'cache_user:123'
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
