/**
 * Cache Module
 *
 * Configures the cache system for dependency injection.
 *
 * Registers:
 * - `CACHE_CONFIG` — raw config object
 * - `CACHE_MANAGER` — CacheManager created by DI (so @Inject decorators fire)
 * - `CACHE_SERVICE` — CacheService for the default store (resolved via async factory)
 *
 * @module cache.module
 */

import { Module, type DynamicModule } from '@abdokouta/react-di';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_CONFIG, CACHE_SERVICE, CACHE_MANAGER } from '@/constants/tokens.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class CacheModule {
  /**
   * Configure the cache module.
   *
   * CacheManager is created by the DI container (useClass) so that
   * @Inject(REDIS_SERVICE_TOKEN) fires correctly when the Redis driver is used.
   *
   * CACHE_SERVICE uses useAsyncFactory — the outer function receives the
   * InversifyJS context, the inner async function resolves the manager and
   * returns the default CacheService.
   *
   * @param config - Cache configuration from defineConfig()
   * @returns Dynamic module definition
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    const global = config.isGlobal ?? true;

    return {
      module: CacheModule,
      providers: [
        // Raw config — injected into CacheManager via @Inject(CACHE_CONFIG)
        {
          provide: CACHE_CONFIG,
          useValue: config,
          isGlobal: global,
        },

        // CacheManager — created by DI so all @Inject decorators fire correctly
        {
          provide: CACHE_MANAGER,
          useClass: CacheManager,
          isGlobal: global,
        },

        // CacheService — resolved lazily after the manager is ready.
        // useAsyncFactory: outer fn receives context, inner async fn produces the value.
        {
          provide: CACHE_SERVICE,
          useAsyncFactory: (context: any) => async () => {
            const manager = context.container.get(CACHE_MANAGER) as CacheManager;
            return manager.store();
          },
          isGlobal: global,
        },
      ],
      exports: global ? [] : [CACHE_SERVICE, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
