/**
 * Redis Configuration
 *
 * Upstash Redis connections for the example app.
 * Credentials are loaded from environment variables.
 *
 * @module config/redis
 */

import { defineConfig } from "@abdokouta/react-redis";

const redisConfig = defineConfig({
  default: "cache",

  connections: {
    /** Main cache connection. */
    cache: {
      url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL || "",
      token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN || "",
    },

    /** Session connection (can point to a different Upstash instance). */
    session: {
      url: import.meta.env.VITE_UPSTASH_SESSION_REST_URL || import.meta.env.VITE_UPSTASH_REDIS_REST_URL || "",
      token: import.meta.env.VITE_UPSTASH_SESSION_REST_TOKEN || import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN || "",
    },
  },
});

export default redisConfig;
