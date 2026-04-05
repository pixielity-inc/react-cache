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
 * import cacheConfig from '@abdokouta/react-cache/config';
 *
 * CacheModule.forRoot(cacheConfig);
 * ```
 */

import { defineConfig } from '@abdokouta/react-cache';

/**
 * Cache configuration
 *
 * Adapts to your environment via Vite environment variables.
 *
 * Environment Variables:
 * - VITE_CACHE_DRIVER: Default cache driver (default: 'memory')
 * - VITE_CACHE_PREFIX: Global cache key prefix (default: 'app_')
 * - VITE_CACHE_MEMORY_MAX_SIZE: Memory store max entries (default: 1000)
 * - VITE_CACHE_MEMORY_TTL: Memory store TTL in seconds (default: 300)
 * - VITE_REDIS_CACHE_CONNECTION: Redis connection name (default: 'cache')
 * - VITE_CACHE_REDIS_PREFIX: Redis key prefix (default: 'cache_')
 * - VITE_CACHE_REDIS_TTL: Redis TTL in seconds (default: 3600)
 * - VITE_REDIS_SESSION_CONNECTION: Session Redis connection (default: 'session')
 * - VITE_CACHE_SESSION_TTL: Session TTL in seconds (default: 86400)
 */
const cacheConfig = defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Default Cache Store
  |--------------------------------------------------------------------------
  */
  default: import.meta.env.VITE_CACHE_DRIVER || 'memory',

  /*
  |--------------------------------------------------------------------------
  | Cache Stores
  |--------------------------------------------------------------------------
  */
  stores: {
    /** 
 * Fast in-memory cache for development and frequently accessed data. 
 */
    memory: {
      driver: 'memory',
      maxSize: Number(import.meta.env.VITE_CACHE_MEMORY_MAX_SIZE) || 1000,
      ttl: Number(import.meta.env.VITE_CACHE_MEMORY_TTL) || 300,
      prefix: 'mem_',
    },

    /** 
 * Persistent Redis cache for production. Supports tagging. 
 */
    redis: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_CACHE_CONNECTION || 'cache',
      prefix: import.meta.env.VITE_CACHE_REDIS_PREFIX || 'cache_',
      ttl: Number(import.meta.env.VITE_CACHE_REDIS_TTL) || 3600,
    },

    /** 
 * Dedicated Redis store for session data with longer TTL. 
 */
    session: {
      driver: 'redis',
      connection: import.meta.env.VITE_REDIS_SESSION_CONNECTION || 'session',
      prefix: 'sess_',
      ttl: Number(import.meta.env.VITE_CACHE_SESSION_TTL) || 86400,
    },

    /** 
 * No-op cache for testing or disabling cache. 
 */
    null: {
      driver: 'null',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Cache Key Prefix
  |--------------------------------------------------------------------------
  */
  prefix: import.meta.env.VITE_CACHE_PREFIX || 'app_',
});

export default cacheConfig;
