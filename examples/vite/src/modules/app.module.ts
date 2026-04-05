import { Module } from "@abdokouta/react-di";
import { CacheModule } from "@abdokouta/react-cache";
import cacheConfig from "@/config/cache.config";

@Module({
  imports: [
    // Dynamic module with forRoot — configuration at root level
    CacheModule.forRoot(cacheConfig),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
