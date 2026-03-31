/**
 * Cache Module
 *
 * Configures the cache system for dependency injection.
 * Provides CacheService (NO manager) to the application.
 *
 * @module cache.module
 */

import { Module, forRoot, type DynamicModule } from '@abdokouta/react-di';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheService } from '@/services/cache.service';
import { CACHE_CONFIG, CACHE_SERVICE } from '@/constants/tokens.constant';

/**
 * Cache module
 *
 * Provides CacheService to the application via dependency injection.
 * The service handles stores internally (NO separate manager).
 *
 * @example
 * ```typescript
 * import { Module } from '@abdokouta/react-di';
 * import { CacheModule } from '@abdokouta/cache';
 * import { RedisModule } from '@abdokouta/redis';
 *
 * @Module({
 *   imports: [
 *     // Configure Redis (optional, only if using Redis store)
 *     RedisModule.forRoot({
 *       default: 'cache',
 *       connections: {
 *         cache: {
 *           url: process.env.UPSTASH_REDIS_REST_URL!,
 *           token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 *         },
 *       },
 *     }),
 *
 *     // Configure Cache
 *     CacheModule.forRoot({
 *       default: 'memory',
 *       stores: {
 *         memory: {
 *           driver: 'memory',
 *           maxSize: 1000,
 *           ttl: 300,
 *         },
 *         redis: {
 *           driver: 'redis',
 *           connection: 'cache',
 *           prefix: 'app_',
 *         },
 *         null: {
 *           driver: 'null',
 *         },
 *       },
 *       prefix: 'myapp_',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class CacheModule {
  /**
   * Configure the cache module
   *
   * @param config - Cache configuration
   * @returns Dynamic module
   *
   * @example
   * ```typescript
   * CacheModule.forRoot({
   *   default: 'memory',
   *   stores: {
   *     memory: {
   *       driver: 'memory',
   *       maxSize: 1000,
   *       ttl: 300,
   *     },
   *   },
   * })
   * ```
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    return forRoot(CacheModule, {
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
        },
        {
          provide: CACHE_SERVICE,
          useValue: CacheService,
        },
        CacheService,
      ],
      exports: [CacheService, CACHE_CONFIG],
    });
  }
}
