/**
 * Cache Module
 *
 * Registers:
 * - `CACHE_CONFIG` — raw config object
 * - `CacheManager` — created by DI so @Inject decorators fire
 * - `CACHE_MANAGER` — useExisting alias to CacheManager
 *
 * Users inject `CACHE_MANAGER` (or `CacheManager` directly) and call
 * `manager.store()` to get a `CacheService`, or use the `useCache()`
 * hook which does this automatically.
 *
 * @module cache.module
 */

import { Module, type DynamicModule } from '@abdokouta/ts-container';

import type { CacheModuleOptions } from '@/interfaces';
import { CacheManager } from '@/services/cache-manager.service';
import { CACHE_CONFIG, CACHE_MANAGER } from '@/constants/tokens.constant';

/**
 * CacheModule — provides multi-driver caching with DI integration.
 *
 * Follows the standard manager DI pattern:
 * - `CACHE_CONFIG` — raw config object
 * - `CacheManager` — class-based injection
 * - `CACHE_MANAGER` — useExisting alias
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     CacheModule.forRoot({
 *       default: 'memory',
 *       stores: {
 *         memory: { driver: 'memory', maxSize: 100 },
 *         redis: { driver: 'redis', connection: 'cache' },
 *       },
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
   * Configure the cache module with runtime configuration.
   *
   * @param config - Cache configuration with named stores
   * @returns DynamicModule with all cache providers
   */
  static forRoot(config: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        { provide: CACHE_CONFIG, useValue: config },
        { provide: CacheManager, useClass: CacheManager },
        { provide: CACHE_MANAGER, useExisting: CacheManager },
      ],
      exports: [CacheManager, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
