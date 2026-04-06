import { Module } from "@abdokouta/ts-container";
import { CacheModule } from "@abdokouta/react-cache";
import { RedisModule } from "@abdokouta/react-redis";

import cacheConfig from "@/config/cache.config";
import redisConfig from "@/config/redis.config";

@Module({
  imports: [
    // RedisModule must be imported BEFORE CacheModule so RedisService
    // is available when CacheManager tries to create Redis stores.
    RedisModule.forRoot(redisConfig),

    // Cache module — uses RedisService from RedisModule for the 'redis' driver
    CacheModule.forRoot(cacheConfig),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
