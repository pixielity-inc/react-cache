/**
 * useCachedQuery Hook
 *
 * React hook for caching async query results with automatic cache management.
 * Similar to React Query but using the cache system.
 *
 * **Features:**
 * - Automatic caching of query results
 * - Loading and error states
 * - Cache invalidation
 * - Configurable TTL
 *
 * **Note:** This requires React and @abdokouta/ts-container to be installed.
 *
 * @module hooks/use-cached-query
 */

import { useState, useEffect, useCallback } from 'react';

import { useCache } from '@/hooks/use-cache/use-cache.hook';
import type { UseCachedQueryResult } from '@/interfaces/use-cached-query-result.interface';
import type { UseCachedQueryOptions } from '@/interfaces/use-cached-query-options.interface';

/**
 * Hook for caching async query results
 *
 * Automatically caches query results and manages loading/error states.
 *
 * @param options - Query options
 * @returns Query result with data, loading, error, and control functions
 *
 * @example
 * ```typescript
 * function UserProfile({ userId }: { userId: string }) {
 *   const { data: user, isLoading, error, refetch } = useCachedQuery({
 *     key: `user:${userId}`,
 *     queryFn: async () => {
 *       const response = await fetch(`/api/users/${userId}`);
 *       return response.json();
 *     },
 *     ttl: 3600, // Cache for 1 hour
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user.name}</h1>
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With cache invalidation
 * function UserList() {
 *   const { data: users, invalidate } = useCachedQuery({
 *     key: 'users:list',
 *     queryFn: fetchUsers,
 *     ttl: 600,
 *   });
 *
 *   const handleUserUpdate = async (user) => {
 *     await updateUser(user);
 *     await invalidate(); // Clear cache and refetch
 *   };
 *
 *   return <UserTable users={users} onUpdate={handleUserUpdate} />;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Conditional query
 * function ConditionalData({ shouldFetch }: { shouldFetch: boolean }) {
 *   const { data } = useCachedQuery({
 *     key: 'conditional:data',
 *     queryFn: fetchData,
 *     enabled: shouldFetch, // Only fetch when enabled
 *   });
 *
 *   return <div>{data?.value}</div>;
 * }
 * ```
 */
export function useCachedQuery<T = any>(
  options: UseCachedQueryOptions<T>
): UseCachedQueryResult<T> {
  const { key, queryFn, ttl = 300, storeName, enabled = true, refetchOnMount = false } = options;

  const cache = useCache(storeName);

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch data from cache or execute query
   */
  const fetchData = useCallback(
    async (forceRefetch: boolean = false) => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let result: T;

        if (forceRefetch) {
          // Force refetch: execute query and update cache
          result = await queryFn();
          await cache.put(key, result, ttl);
        } else {
          // Try cache first, then query
          result = await cache.remember(key, ttl, queryFn);
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [key, queryFn, ttl, enabled, cache]
  );

  /**
   * Refetch data (uses cache if available)
   */
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  /**
   * Invalidate cache and refetch
   */
  const invalidate = useCallback(async () => {
    await cache.forget(key);
    await fetchData(true);
  }, [key, cache, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData(refetchOnMount);
  }, [key, enabled]); // Re-fetch when key or enabled changes

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
  };
}
