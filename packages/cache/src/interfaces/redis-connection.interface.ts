/**
 * Redis connection interface
 * 
 * Minimal interface for Redis operations required by the cache store.
 * This matches the RedisConnection interface from @abdokouta/redis.
 * 
 * @module types/redis-connection
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
