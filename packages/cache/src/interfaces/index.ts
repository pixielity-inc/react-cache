/**
 * Cache Interfaces
 *
 * All interface definitions for the cache package.
 *
 * @module interfaces
 */

export type { CacheModuleOptions } from './cache-module-options.interface';
export type { MemoryStoreConfig } from './memory-store-config.interface';
export type { RedisStoreConfig } from './redis-store-config.interface';
export type { NullStoreConfig } from './null-store-config.interface';
export type { RedisConnection } from './redis-connection.interface';
export type { Store } from './store.interface';
export type { TaggableStore } from './taggable-store.interface';
export type { TagSet } from './tag-set.interface';
export type { TaggedCache } from './tagged-cache.interface';
export type { UseCachedQueryOptions } from './use-cached-query-options.interface';
export type { UseCachedQueryResult } from './use-cached-query-result.interface';
export type { CacheServiceInterface } from './cache-service.interface';
