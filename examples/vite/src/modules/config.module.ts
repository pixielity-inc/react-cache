import { Module, forRoot, type DynamicModule } from "@abdokouta/react-di";

import { ConfigService, type AppConfig } from "@/services/config.service";
import { CONFIG_SERVICE } from "@/constants";

@Module({})
export class ConfigModule {
  /**
   * Dynamic module pattern: forRoot
   * Used to configure a module with runtime options
   */
  static forRoot(config: AppConfig): DynamicModule {
    return forRoot(ConfigModule, {
      providers: [
        {
          provide: CONFIG_SERVICE,
          useValue: new ConfigService(config),
        },
      ],
      exports: [CONFIG_SERVICE],
    });
  }
}
