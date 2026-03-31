/**
 * useCache Hook
 * 
 * React hook for accessing the cache system in components.
 * Provides a convenient way to interact with cache from React components.
 * 
 * **Note:** This requires React and @abdokouta/react-di to be installed.
 * 
 * @module hooks/use-cache
 */

import { useInject } from '@abdokouta/react-di';

import { CacheService } from '@/services/cache.service';

/**
 * Hook to access the cache system
 * 
 * Returns the CacheService instance from the DI container.
 * 
 * @param storeName - Optional store name (uses default if not specified)
 * @returns CacheService instance for cache operations
 * 
 * @example
 * ```typescript
 * function UserProfile({ userId }: { userId: string }) {
 *   const cache = useCache();
 *   const [user, setUser] = useState(null);
 * 
 *   useEffect(() => {
 *     async function loadUser() {
 *       // Try to get from cache first
 *       const cached = await cache.get(`user:${userId}`);
 *       
 *       if (cached) {
 *         setUser(cached);
 *       } else {
 *         const user = await fetchUser(userId);
 *         await cache.put(`user:${userId}`, user, 3600);
 *         setUser(user);
 *       }
 *     }
 *     
 *     loadUser();
 *   }, [userId]);
 * 
 *   return <div>{user?.name}</div>;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Use specific store
 * function StatsWidget() {
 *   const memoryCache = useCache('memory');
 *   
 *   const incrementViews = async () => {
 *     await memoryCache.increment('page:views');
 *   };
 *   
 *   return <button onClick={incrementViews}>View Page</button>;
 * }
 * ```
 */
export function useCache(storeName?: string): CacheService {
  const cacheService = useInject<CacheService>(CacheService);
  
  if (!cacheService) {
    throw new Error(
      'CacheService not found in DI container. ' +
      'Make sure CacheModule is imported in your application.'
    );
  }
  
  return storeName ? cacheService.store(storeName) : cacheService;
}
