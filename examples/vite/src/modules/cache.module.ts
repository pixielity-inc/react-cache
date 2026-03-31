import {
  Module,
  Global,
  forFeature,
  type DynamicModule,
} from "@abdokouta/react-di";
import { CacheService, type CacheConfig } from "@/services/cache.service";
import { CACHE_SERVICE, CACHE_CONFIG } from "@/constants";

@Global()
@Module({})
export class CacheModule {
  /**
   * Dynamic module pattern: forFeature
   * Used for feature-specific configuration that can be imported multiple times
   *
   * @Global decorator makes CacheService available to all modules without explicit imports
   * This is useful for shared services like caching, logging, or configuration
   */
  static forFeature(config: CacheConfig): DynamicModule {
    console.log(`[CacheModule.forFeature] Called with config:`, config);

    return forFeature(CacheModule, {
      providers: [
        {
          provide: CACHE_CONFIG,
          useValue: config,
        },
        { provide: CACHE_SERVICE, useClass: CacheService },
      ],
      exports: [CACHE_SERVICE],
    });
  }
}
