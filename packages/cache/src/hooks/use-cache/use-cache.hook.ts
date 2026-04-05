/**
 * useCache Hook
 *
 * React hook for accessing the cache system in components.
 *
 * @module hooks/use-cache
 */

import { useInject } from '@abdokouta/react-di';

import { CacheService } from '@/services/cache.service';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_SERVICE, CACHE_MANAGER } from '@/constants/tokens.constant';

/**
 * Hook to access the cache system.
 *
 * Without arguments, returns the default store's CacheService.
 * With a store name, resolves that store via CacheManager.
 *
 * @param storeName - Optional store name (uses default if omitted)
 * @returns CacheService instance for cache operations
 *
 * @example
 * ```typescript
 * function UserProfile({ userId }: { userId: string }) {
 *   const cache = useCache();
 *
 *   useEffect(() => {
 *     cache.remember(`user:${userId}`, 3600, () => fetchUser(userId))
 *       .then(setUser);
 *   }, [userId]);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use a specific store
 * const redisCache = useCache('redis');
 * ```
 */
export function useCache(storeName?: string): CacheService {
  if (storeName) {
    // Resolve a specific store via the manager
    const manager = useInject<CacheManager>(CACHE_MANAGER);

    if (!manager) {
      throw new Error(
        'CacheManager not found in DI container. ' +
          'Make sure CacheModule.forRoot() is imported in your application.'
      );
    }

    return manager.store(storeName);
  }

  // Default store — injected directly as CACHE_SERVICE
  const cacheService = useInject<CacheService>(CACHE_SERVICE);

  if (!cacheService) {
    throw new Error(
      'CacheService not found in DI container. ' +
        'Make sure CacheModule.forRoot() is imported in your application.'
    );
  }

  return cacheService;
}
