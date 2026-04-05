/**
 * @abdokouta/react-redis
 *
 * Client-side Redis connection management for browser environments using the
 * Upstash HTTP REST API. Provides browser-compatible Redis operations without
 * requiring Node.js or persistent TCP connections.
 *
 * Key features:
 * - Browser-compatible (HTTP-based)
 * - Multiple named connections
 * - Dependency injection support
 * - React hooks
 * - TypeScript support
 * - Production-ready error handling
 *
 * @example
 * Basic setup with dependency injection:
 * ```tsx
 * import { RedisModule } from '@abdokouta/react-redis';
 *
 * @Module({
 *   imports: [
 *     RedisModule.forRoot({
 *       default: 'main',
 *       connections: {
 *         main: {
 *           url: 'https://your-redis.upstash.io',
 *           token: 'your-token',
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Using the Redis service:
 * ```tsx
 * import { RedisService } from '@abdokouta/react-redis';
 *
 * @Injectable()
 * class CacheService {
 *   constructor(
 *     @Inject(RedisService) private redis: RedisService
 *   ) {}
 *
 *   async cacheData(key: string, value: any) {
 *     await this.redis.set(key, JSON.stringify(value), { ex: 3600 });
 *   }
 * }
 * ```
 *
 * @example
 * Using React hooks:
 * ```tsx
 * import { useRedis } from '@abdokouta/react-redis';
 *
 * function CacheComponent() {
 *   const redis = useRedis();
 *
 *   const saveData = async () => {
 *     await redis.set('key', 'value');
 *   };
 *
 *   return <button onClick={saveData}>Save</button>;
 * }
 * ```
 *
 * @example
 * Using multiple connections:
 * ```tsx
 * import { useRedisConnection } from '@abdokouta/react-redis';
 *
 * function MultiConnectionComponent() {
 *   const mainRedis = useRedisConnection('main');
 *   const cacheRedis = useRedisConnection('cache');
 *
 *   return <div>Connected to multiple Redis instances</div>;
 * }
 * ```
 *
 * @module @abdokouta/react-redis
 */

// ============================================================================
// Module (DI Configuration)
// ============================================================================
export { RedisModule } from "./redis.module";

// ============================================================================
// Services
// ============================================================================
export { RedisService } from "./services/redis.service";

// ============================================================================
// Connections
// ============================================================================
export { UpstashConnection } from "./connections/upstash.connection";

// ============================================================================
// Connectors
// ============================================================================
export { UpstashConnector } from "./connectors/upstash.connector";

// ============================================================================
// Interfaces
// ============================================================================
export type {
  RedisConnection,
  RedisPipeline,
  SetOptions,
} from "./interfaces/redis-connection.interface";

export type {
  RedisConfig,
  RedisConnectionConfig,
} from "./interfaces/redis-config.interface";

export type { RedisConnector } from "./interfaces/redis-connector.interface";

export type { IRedisService } from "./interfaces/redis-service.interface";

// ============================================================================
// Constants/Tokens
// ============================================================================
export { REDIS_CONFIG, REDIS_CONNECTOR } from "./constants/tokens.constant";

// ============================================================================
// React Hooks
// ============================================================================
export { useRedis, useRedisConnection } from "./hooks/use-redis";

// ============================================================================
// Utils
// ============================================================================
export { defineConfig } from "./utils";
