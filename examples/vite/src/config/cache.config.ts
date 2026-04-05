/**
 * Cache Configuration
 *
 * Uses @abdokouta/react-cache's defineConfig for type-safe configuration.
 * Supports memory, Redis (Upstash), and null drivers.
 *
 * To use Redis, pass an actual RedisConnection instance (e.g., from @upstash/redis).
 * The memory driver is used by default and requires no external dependencies.
 *
 * @module config/cache
 */

import { defineConfig } from "@abdokouta/react-cache";

/**
 * Create an Upstash Redis connection if credentials are available.
 * Returns undefined when credentials are missing (Redis store won't be usable).
 */
function createUpstashConnection() {
  const url = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return undefined;
  }

  // Lazy-import @upstash/redis at runtime — only loaded when Redis is actually used.
  // This avoids a hard dependency for apps that only use the memory driver.
  //
  // Example with @upstash/redis:
  //   import { Redis } from "@upstash/redis";
  //   return new Redis({ url, token });
  //
  // For now, return undefined (memory is the default).
  return undefined;
}

const redisConnection = createUpstashConnection();

const cacheConfig = defineConfig({
  default: import.meta.env.VITE_CACHE_DRIVER || "memory",

  stores: {
    /** 
 * Fast in-memory cache. Data is lost on page refresh. 
 */
    memory: {
      driver: "memory",
      maxSize: Number(import.meta.env.VITE_CACHE_MEMORY_MAX_SIZE) || 100,
      ttl: Number(import.meta.env.VITE_CACHE_MEMORY_TTL) || 300,
      prefix: "mem_",
    },

    /**
     * Redis cache via Upstash.
     * Requires VITE_UPSTASH_REDIS_REST_URL and VITE_UPSTASH_REDIS_REST_TOKEN.
     * Only usable when a valid connection is provided.
     */
    ...(redisConnection
      ? {
          redis: {
            driver: "redis" as const,
            connection: redisConnection,
            prefix: import.meta.env.VITE_CACHE_REDIS_PREFIX || "cache_",
            ttl: Number(import.meta.env.VITE_CACHE_REDIS_TTL) || 3600,
          },
        }
      : {}),

    /** 
 * No-op cache for testing or disabling cache. 
 */
    null: {
      driver: "null",
    },
  },

  prefix: import.meta.env.VITE_CACHE_PREFIX || "app_",
});

export default cacheConfig;
