/**
 * Redis Factory Interface
 *
 * Resolves Redis connection instances by name.
 * This mirrors Laravel's `Illuminate\Contracts\Redis\Factory`.
 *
 * Implementations should be provided by a Redis package
 * (e.g., @abdokouta/react-redis) and registered in the DI container.
 *
 * @module interfaces/redis-factory
 */

import type { RedisConnection } from './redis-connection.interface';

export interface RedisFactory {
  /**
   * Get a Redis connection by name
   *
   * @param name - Connection name (e.g., 'default', 'cache', 'session')
   * @returns A connected Redis client
   */
  connection(name?: string): RedisConnection;
}
