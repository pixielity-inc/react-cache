/**
 * Cache Module Options
 *
 * Defines the default store and configuration for all available stores.
 * Similar to Laravel's cache.php configuration file.
 *
 * @module interfaces/cache-module-options
 *
 * @example
 * ```typescript
 * const config: CacheModuleOptions = {
 *   default: 'redis',
 *   prefix: 'myapp',
 *   stores: {
 *     memory: {
 *       driver: 'memory',
 *       maxSize: 1000,
 *       ttl: 300,
 *     },
 *     redis: {
 *       driver: 'redis',
 *       connection: redisClient,
 *       prefix: 'cache',
 *     },
 *   },
 * };
 * ```
 */

import type { StoreConfig } from '@/types/store-config.type';

/**
 * Cache module options interface
 *
 * Main configuration object for the cache module.
 * Defines the default store and all available store configurations.
 */
export interface CacheModuleOptions {
  /**
   * Default cache store name
   *
   * This store will be used when no specific store is requested.
   * Must match one of the keys in the stores object.
   *
   * @example 'redis' | 'memory' | 'null'
   */
  default: string;

  /**
   * Cache store configurations
   *
   * Object mapping store names to their configurations.
   * Each store can use a different driver and have different settings.
   *
   * @example
   * ```typescript
   * {
   *   memory: { driver: 'memory', maxSize: 1000 },
   *   redis: { driver: 'redis', connection: redisClient },
   *   null: { driver: 'null' },
   * }
   * ```
   */
  stores: Record<string, StoreConfig>;

  /**
   * Global cache key prefix
   *
   * Optional prefix applied to all cache keys across all stores.
   * Useful for avoiding key collisions when multiple apps share infrastructure.
   *
   * @default ''
   * @example 'myapp_' results in keys like 'myapp_user:123'
   */
  prefix?: string;
}
