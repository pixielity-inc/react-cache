/**
 * useCache Hook
 *
 * React hook for accessing the cache system in components.
 *
 * @module hooks/use-cache
 */

import { useInject } from '@abdokouta/ts-container-react';

import type { CacheService } from '@/services/cache.service';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_MANAGER } from '@/constants/tokens.constant';

/**
 * Hook to access the cache system.
 *
 * Returns a CacheService for the given store (or the default store).
 *
 * @param storeName - Optional store name (uses default if omitted)
 * @returns CacheService instance for cache operations
 *
 * @example
 * ```typescript
 * const cache = useCache();
 * await cache.remember('user:1', 3600, () => fetchUser(1));
 *
 * const redis = useCache('redis');
 * await redis.put('key', 'value', 3600);
 * ```
 */
export function useCache(storeName?: string): CacheService {
  const manager = useInject<CacheManager>(CACHE_MANAGER);

  if (!manager) {
    throw new Error(
      'CacheManager not found in DI container. ' +
      'Make sure CacheModule.forRoot() is imported in your application.',
    );
  }

  return manager.store(storeName);
}
