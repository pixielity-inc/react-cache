/**
 * Cache Module
 *
 * Registers:
 * - `CACHE_CONFIG` — raw config object
 * - `CACHE_MANAGER` — CacheManager (created by DI so @Inject decorators fire)
 *
 * Users inject CACHE_MANAGER and call manager.store() to get a CacheService,
 * or use the useCache() hook which does this automatically.
 *
 * @module cache.module
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_CONFIG, CACHE_MANAGER } from '@/constants/tokens.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class CacheModule {
  static forRoot(config: CacheModuleOptions): DynamicModule {

    return {
      module: CacheModule,
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
        },
        {
          provide: CACHE_MANAGER,
          useClass: CacheManager,
        },
      ],
      exports: [CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
