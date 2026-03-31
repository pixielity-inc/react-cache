/**
 * Define Config Utility
 *
 * Helper function to define cache configuration with type safety.
 *
 * @module @abdokouta/cache
 */

import type { CacheModuleOptions } from '../interfaces';

/**
 * Helper function to define cache configuration with type safety
 *
 * Provides IDE autocomplete and type checking for configuration objects.
 * This pattern is consistent with modern tooling (Vite, Vitest, etc.).
 *
 * @param config - The cache configuration object
 * @returns The same configuration object with proper typing
 *
 * @example
 * ```typescript
 * // cache.config.ts
 * import { defineConfig } from '@abdokouta/cache';
 *
 * export default defineConfig({
 *   default: 'memory',
 *   stores: {
 *     memory: {
 *       driver: 'memory',
 *       maxSize: 1000,
 *       ttl: 300,
 *     },
 *     redis: {
 *       driver: 'redis',
 *       connection: 'cache',
 *       prefix: 'cache_',
 *     },
 *   },
 *   prefix: 'app_',
 * });
 * ```
 */
export function defineConfig(config: CacheModuleOptions): CacheModuleOptions {
  return config;
}
