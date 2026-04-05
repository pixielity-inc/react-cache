/**
 * React hook for accessing Redis service
 *
 * @remarks
 * This hook provides a convenient way to access the Redis service in React
 * components. It integrates with @abdokouta/react-di's dependency injection
 * system to retrieve the Redis service instance.
 *
 * @packageDocumentation
 */

import { useInject } from "@abdokouta/react-di";
import { RedisService } from "@/services/redis.service";
import { RedisModule } from "@/redis.module";
import type { RedisConnection } from "@/interfaces";

/**
 * Hook for accessing Redis service in React components
 *
 * @returns The Redis service instance
 *
 * @remarks
 * This hook uses the dependency injection container to retrieve the
 * Redis service. The service must be provided by RedisModule.forRoot()
 * in your application's module configuration.
 *
 * The hook provides access to:
 * - Connection management
 * - Multiple named connections
 * - All Redis operations via connections
 *
 * @example
 * ```typescript
 * import { useRedis } from '@abdokouta/react-redis';
 *
 * function UserProfile({ userId }: { userId: string }) {
 *   const redis = useRedis();
 *   const [user, setUser] = useState<User | null>(null);
 *
 *   useEffect(() => {
 *     async function loadUser() {
 *       // Get the default connection
 *       const connection = await redis.connection();
 *
 *       // Try to get from cache
 *       const cached = await connection.get(`user:${userId}`);
 *       if (cached) {
 *         setUser(JSON.parse(cached));
 *         return;
 *       }
 *
 *       // Fetch from API and cache
 *       const user = await fetchUser(userId);
 *       await connection.set(
 *         `user:${userId}`,
 *         JSON.stringify(user),
 *         { ex: 3600 }
 *       );
 *       setUser(user);
 *     }
 *
 *     loadUser();
 *   }, [userId, redis]);
 *
 *   return <div>{user?.name}</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Using multiple connections
 * function SessionManager() {
 *   const redis = useRedis();
 *
 *   async function saveSession(sessionId: string, data: SessionData) {
 *     // Use the session connection
 *     const session = await redis.connection('session');
 *     await session.set(
 *       `session:${sessionId}`,
 *       JSON.stringify(data),
 *       { ex: 86400 } // 24 hours
 *     );
 *   }
 *
 *   async function cacheData(key: string, value: unknown) {
 *     // Use the cache connection
 *     const cache = await redis.connection('cache');
 *     await cache.set(key, JSON.stringify(value), { ex: 3600 });
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRedis(): RedisService {
  return useInject(RedisService, RedisModule);
}

/**
 * Hook for accessing a specific Redis connection
 *
 * @param name - The connection name (optional, defaults to the configured default)
 * @returns A promise that resolves to the Redis connection
 *
 * @remarks
 * This is a convenience hook that combines useRedis() with connection().
 * It's useful when you always need the same connection in a component.
 *
 * Note: This hook returns a Promise, so you'll need to handle it with
 * useEffect or React Suspense.
 *
 * @example
 * ```typescript
 * import { useRedisConnection } from '@abdokouta/react-redis';
 *
 * function CacheManager() {
 *   const [connection, setConnection] = useState<RedisConnection | null>(null);
 *   const getConnection = useRedisConnection('cache');
 *
 *   useEffect(() => {
 *     getConnection.then(setConnection);
 *   }, [getConnection]);
 *
 *   async function clearCache() {
 *     if (!connection) return;
 *     await connection.flushdb();
 *   }
 *
 *   return <button onClick={clearCache}>Clear Cache</button>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With React Suspense (future)
 * function CacheStats() {
 *   const connection = use(useRedisConnection('cache'));
 *
 *   // Use the connection directly
 *   // ...
 * }
 * ```
 */
export function useRedisConnection(name?: string): Promise<RedisConnection> {
  const redis = useRedis();
  return redis.connection(name);
}
