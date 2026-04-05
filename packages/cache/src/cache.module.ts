/**
 * Cache Module
 *
 * Configures the cache system for dependency injection.
 * Registers CacheManager as both CACHE_MANAGER and CACHE_SERVICE
 * (the manager IS a CacheService via inheritance).
 *
 * @module cache.module
 *
 * @example
 * ```typescript
 * import { Module } from '@abdokouta/react-di';
 * import { CacheModule } from '@abdokouta/react-cache';
 *
 * @Module({
 *   imports: [
 *     CacheModule.forRoot({
 *       default: 'memory',
 *       stores: {
 *         memory: { driver: 'memory', maxSize: 1000, ttl: 300 },
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@abdokouta/react-di';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_CONFIG, CACHE_SERVICE, CACHE_MANAGER } from '@/constants/tokens.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class CacheModule {
  /**
   * Configure the cache module with the given options.
   *
   * Registers:
   * - `CACHE_CONFIG` — the raw config object
   * - `CACHE_MANAGER` — the CacheManager instance (cache ops + management)
   * - `CACHE_SERVICE` — same instance, typed as CacheService (cache ops only)
   *
   * Both tokens point to the same CacheManager instance because the
   * manager extends CacheService (inherits all cache operations).
   *
   * @param config - Cache configuration from defineConfig()
   * @returns Dynamic module definition
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    // Create the manager eagerly — it resolves the default store in its constructor
    const manager = new CacheManager(config);

    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
          isGlobal: true,
        },
        {
          provide: CACHE_MANAGER,
          useValue: manager,
          isGlobal: true,
        },
        {
          // Same instance — manager IS a CacheService via inheritance
          provide: CACHE_SERVICE,
          useValue: manager,
          isGlobal: true,
        },
      ],
      exports: [CACHE_SERVICE, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
