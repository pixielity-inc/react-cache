/**
 * Redis module for dependency injection configuration
 *
 * @remarks
 * This module configures the Redis service and its dependencies for use
 * with @abdokouta/react-di's dependency injection system.
 *
 * The module follows the dynamic module pattern, allowing configuration
 * to be provided at runtime via the forRoot() method.
 *
 * @packageDocumentation
 */

import { Module, type DynamicModule } from "@abdokouta/react-di";
import { RedisService } from "@/services/redis.service";
import { UpstashConnector } from "@/connectors/upstash.connector";
import { REDIS_CONFIG, REDIS_CONNECTOR } from "@/constants/tokens.constant";
import type { RedisConfig } from "@/interfaces";

/**
 * Redis module for configuring Redis connections
 *
 * @remarks
 * This module provides:
 * - RedisService for connection management and operations
 * - Automatic configuration of Upstash connector
 * - Support for multiple named connections
 * - Integration with @abdokouta/react-di DI system
 *
 * The module uses the dynamic module pattern to accept runtime configuration.
 *
 * @example
 * ```typescript
 * // app.module.ts
 * import { Module } from '@abdokouta/react-di';
 * import { RedisModule } from '@abdokouta/react-redis';
 *
 * @Module({
 *   imports: [
 *     RedisModule.forRoot({
 *       default: 'cache',
 *       connections: {
 *         cache: {
 *           url: process.env.UPSTASH_REDIS_REST_URL!,
 *           token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 *         },
 *         session: {
 *           url: process.env.UPSTASH_SESSION_URL!,
 *           token: process.env.UPSTASH_SESSION_TOKEN!,
 *           timeout: 10000,
 *         },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Using Redis in a service
 * import { Injectable } from '@abdokouta/react-di';
 * import { RedisService } from '@abdokouta/react-redis';
 *
 * @Injectable()
 * export class UserService {
 *   constructor(private readonly redis: RedisService) {}
 *
 *   async cacheUser(user: User): Promise<void> {
 *     const connection = await this.redis.connection('cache');
 *     await connection.set(
 *       `user:${user.id}`,
 *       JSON.stringify(user),
 *       { ex: 3600 }
 *     );
 *   }
 * }
 * ```
 */
@Module({})
export class RedisModule {
  /**
   * Configure the Redis module with runtime configuration
   *
   * @param config - The Redis configuration object
   * @returns A dynamic module with configured providers
   *
   * @remarks
   * This method:
   * 1. Registers the configuration as a provider
   * 2. Registers the Upstash connector
   * 3. Registers the Redis service
   * 4. Exports the service for use in other modules
   *
   * The configuration is validated at runtime when connections are first used.
   *
   * @example
   * ```typescript
   * RedisModule.forRoot({
   *   default: 'cache',
   *   connections: {
   *     cache: {
   *       url: 'https://my-redis.upstash.io',
   *       token: 'my-token',
   *       retry: {
   *         retries: 3,
   *         backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000)
   *       }
   *     }
   *   }
   * })
   * ```
   */
  static forRoot(config: RedisConfig): DynamicModule {
    const global = config.isGlobal ?? true;

    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS_CONFIG,
          useValue: config,
          isGlobal: global,
        },
        {
          provide: REDIS_CONNECTOR,
          useClass: UpstashConnector,
          isGlobal: global,
        },
        {
          provide: RedisService,
          useClass: RedisService,
          isGlobal: global,
        },
      ],
      exports: global ? [] : [RedisService],
    };
  }
}
