/**
 * Cache driver types
 *
 * - memory: In-memory cache (fast, but not shared across processes)
 * - redis: Redis-backed cache (shared, persistent, supports tagging)
 * - null: No-op cache (useful for testing or disabling cache)
 *
 * @module types/cache-driver
 */
export type CacheDriver = 'memory' | 'redis' | 'null';
