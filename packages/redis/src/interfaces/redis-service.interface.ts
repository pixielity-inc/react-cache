/**
 * Redis Service Interface
 *
 * Contract for the Redis service. Implement this interface to provide
 * a custom Redis service or to mock it in tests.
 *
 * @module interfaces/redis-service
 */

import type { RedisConnection } from "./redis-connection.interface";

/**
 * IRedisService
 *
 * Defines the public API for managing Redis connections.
 * The concrete implementation is `RedisService`.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(@Inject(RedisService) private redis: IRedisService) {}
 *
 *   async cache(key: string, value: string) {
 *     const conn = await this.redis.connection('cache');
 *     await conn.set(key, value, { ex: 3600 });
 *   }
 * }
 * ```
 */
export interface IRedisService {
  /**
   * Get a Redis connection by name.
   *
   * Connections are lazily initialized and cached.
   *
   * @param name - Connection name (uses default if omitted)
   * @returns The Redis connection
   * @throws Error if the connection is not configured
   */
  connection(name?: string): Promise<RedisConnection>;

  /**
   * Disconnect a specific connection.
   *
   * @param name - Connection name (uses default if omitted)
   */
  disconnect(name?: string): Promise<void>;

  /**
   * Disconnect all active connections.
   */
  disconnectAll(): Promise<void>;

  /**
   * Get all configured connection names.
   */
  getConnectionNames(): string[];

  /**
   * Get the default connection name.
   */
  getDefaultConnectionName(): string;

  /**
   * Check if a connection is currently active (cached).
   *
   * @param name - Connection name (uses default if omitted)
   */
  isConnectionActive(name?: string): boolean;
}
