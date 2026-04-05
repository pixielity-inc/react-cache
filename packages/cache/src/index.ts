/**
 * @abdokouta/react-cache
 *
 * Laravel-inspired caching system for Refine with multiple drivers and stores.
 * Provides a clean, unified interface for caching with support for memory,
 * Redis, and null stores, along with tagging capabilities for organized cache management.
 *
 * @example
 * Basic usage with memory store:
 * ```typescript
 * import { CacheModule, CacheService } from '@abdokouta/react-cache';
 * import { Module, Injectable, Inject } from '@abdokouta/react-di';
 *
 * @Module({
 *   imports: [
 *     CacheModule.forRoot({
 *       default: 'memory',
 *       stores: {
 *         memory: {
 *           driver: 'memory',
 *           maxSize: 100,
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * @Injectable()
 * class UserService {
 *   constructor(@Inject(CacheService) private cache: CacheService) {}
 *
 *   async getUser(id: string) {
 *     return this.cache.remember(`user:${id}`, 3600, async () => {
 *       return await fetchUserFromDatabase(id);
 *     });
 *   }
 * }
 * ```
 *
 * @example
 * Using cache tags:
 * ```typescript
 * // Tag cache entries for easy invalidation
 * await cache.tags(['users', 'posts']).put('user:1:posts', data, 3600);
 *
 * // Flush all entries with specific tags
 * await cache.tags(['users']).flush();
 * ```
 *
 * @example
 * React hook usage:
 * ```typescript
 * import { useCache, useCachedQuery } from '@abdokouta/react-cache';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const cache = useCache();
 *
 *   const { data, isLoading } = useCachedQuery(
 *     `user:${userId}`,
 *     () => fetchUser(userId),
 *     { ttl: 3600 }
 *   );
 *
 *   return <div>{data?.name}</div>;
 * }
 * ```
 *
 * @module @abdokouta/react-cache
 */

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { CacheModule } from './cache.module';

// ============================================================================
// Core Services
// ============================================================================
export { CacheManager } from './services/cache-manager.service';
export { CacheService } from './services/cache.service';

// ============================================================================
// Stores
// ============================================================================
export { MemoryStore } from './stores/memory.store';
export { RedisStore } from './stores/redis.store';
export { NullStore } from './stores/null.store';

// ============================================================================
// Tags
// ============================================================================
export { TagSet } from './tags/tag-set';
export { RedisTagSet } from './tags/redis-tag-set';
export { TaggedCache } from './tags/tagged-cache';

// ============================================================================
// React Hooks
// ============================================================================
export { useCache } from './hooks';
export { useCachedQuery } from './hooks';

// ============================================================================
// Types
// ============================================================================
export type { CacheDriver, StoreConfig, DriverCreator } from './types';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  CacheModuleOptions,
  MemoryStoreConfig,
  RedisStoreConfig,
  NullStoreConfig,
  RedisConnection,
  RedisFactory,
  Store,
  TaggableStore,
  TagSet as ITagSet,
  TaggedCache as ITaggedCache,
  UseCachedQueryOptions,
  UseCachedQueryResult,
  CacheServiceInterface,
} from './interfaces';

// ============================================================================
// Utils
// ============================================================================
export { defineConfig } from './utils';

// ============================================================================
// Constants (DI Tokens)
// ============================================================================
export { CACHE_CONFIG, CACHE_SERVICE, CACHE_MANAGER, REDIS_FACTORY } from './constants';
