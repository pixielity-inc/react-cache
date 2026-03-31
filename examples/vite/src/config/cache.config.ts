/**
 * Cache Configuration
 * 
 * Unified cache configuration following Laravel and NestJS patterns.
 * All cache stores and settings are defined in a single config object.
 * 
 * @module config/cache
 * 
 * @example
 * ```typescript
 * import cacheConfig from '@pixielity/cache/config';
 * 
 * CacheModule.forRoot(cacheConfig);
 * ```
 */

import type { CacheModuleOptions } from '@pixielity/cache';

/**
 * Cache configuration
 * 
 * Single unified configuration object that automatically adapts to your environment.
 * Uses environment variables for configuration, similar to Laravel's config/cache.php
 * 
 * Environment Variables:
 * - CACHE_DRIVER: Default cache driver (default: 'memory')
 * - CACHE_PREFIX: Global cache key prefix (default: 'app_')
 * - CACHE_MEMORY_MAX_SIZE: Memory store max size (default: 1000)
 * - CACHE_MEMORY_TTL: Memory store TTL in seconds (default: 300)
 * - REDIS_CACHE_CONNECTION: Redis connection name (default: 'cache')
 * - CACHE_REDIS_PREFIX: Redis key prefix (default: 'cache_')
 * - CACHE_REDIS_TTL: Redis TTL in seconds (default: 3600)
 * - REDIS_SESSION_CONNECTION: Session Redis connection (default: 'session')
 * - CACHE_SESSION_TTL: Session TTL in seconds (default: 86400)
 */
const cacheConfig: CacheModuleOptions = {
  /*
  |--------------------------------------------------------------------------
  | Default Cache Store
  |--------------------------------------------------------------------------
  |
  | This option controls the default cache store that will be used by the
  | framework. This store is used when another is not explicitly specified
  | when running a cache operation inside the application.
  |
  */
  default: process.env.CACHE_DRIVER || 'memory',

  /*
  |--------------------------------------------------------------------------
  | Cache Stores
  |--------------------------------------------------------------------------
  |
  | Here you may define all of the cache "stores" for your application as
  | well as their drivers. You may even define multiple stores for the
  | same cache driver to group types of items stored in your caches.
  |
  */
  stores: {
    /**
     * Memory Store
     * 
     * Fast in-memory cache for development and frequently accessed data.
     * Data is lost when the application restarts.
     */
    memory: {
      driver: 'memory',
      maxSize: Number(process.env.CACHE_MEMORY_MAX_SIZE) || 1000,
      ttl: Number(process.env.CACHE_MEMORY_TTL) || 300, // 5 minutes
      prefix: 'mem_',
    },

    /**
     * Redis Store
     * 
     * Persistent cache using Redis for production environments.
     * Supports distributed caching across multiple servers.
     */
    redis: {
      driver: 'redis',
      connection: process.env.REDIS_CACHE_CONNECTION || 'cache',
      prefix: process.env.CACHE_REDIS_PREFIX || 'cache_',
      ttl: Number(process.env.CACHE_REDIS_TTL) || 3600, // 1 hour
    },

    /**
     * Session Store
     * 
     * Dedicated cache store for session data with longer TTL.
     */
    session: {
      driver: 'redis',
      connection: process.env.REDIS_SESSION_CONNECTION || 'session',
      prefix: 'sess_',
      ttl: Number(process.env.CACHE_SESSION_TTL) || 86400, // 24 hours
    },

    /**
     * Null Store
     * 
     * Disables caching. Useful for testing or debugging.
     */
    null: {
      driver: 'null',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Key Prefix
  |--------------------------------------------------------------------------
  |
  | When utilizing a RAM based store such as APC or Memcached, there might
  | be other applications utilizing the same cache. So, we'll specify a
  | value to get prefixed to all our keys so we can avoid collisions.
  |
  */
  prefix: process.env.CACHE_PREFIX || 'app_',
};

export default cacheConfig;
