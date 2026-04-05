/**
 * Cache Module
 *
 * Configures the cache system for dependency injection.
 *
 * Registers:
 * - `CACHE_CONFIG` — raw config object
 * - `CACHE_MANAGER` — CacheManager (store resolution, driver creation)
 * - `CACHE_SERVICE` — CacheService for the default store (public API)
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
   * @param config - Cache configuration from defineConfig()
   * @returns Dynamic module definition
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    const global = config.isGlobal ?? true;
    const manager = new CacheManager(config);
    const defaultCache = manager.store();

    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
          isGlobal: global,
        },
        {
          provide: CACHE_MANAGER,
          useValue: manager,
          isGlobal: global,
        },
        {
          provide: CACHE_SERVICE,
          useValue: defaultCache,
          isGlobal: global,
        },
      ],
      exports: global ? [] : [CACHE_SERVICE, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
