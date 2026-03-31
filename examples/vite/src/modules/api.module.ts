import { Module, forRoot, type DynamicModule } from "@abdokouta/react-di";
import {
  ApiService,
  API_CONNECTION,
  type ApiConnection,
} from "@/services/api.service";
import { API_SERVICE } from "@/constants";

export interface ApiModuleOptions {
  baseUrl: string;
  timeout?: number;
}

@Module({})
export class ApiModule {
  /**
   * Dynamic module with async factory pattern
   * Demonstrates creating connections that require async initialization
   */
  static forRoot(options: ApiModuleOptions): DynamicModule {
    return forRoot(ApiModule, {
      providers: [
        {
          provide: API_CONNECTION,
          useAsyncFactory: () => async (): Promise<ApiConnection> => {
            // Simulate async connection setup (e.g., establishing WebSocket, database connection)
            await new Promise((resolve) => setTimeout(resolve, 100));

            const connection: ApiConnection = {
              baseUrl: options.baseUrl,
              isConnected: false,
              connect: async () => {
                await new Promise((resolve) => setTimeout(resolve, 200));
                connection.isConnected = true;
                console.log(`[API] Connected to ${options.baseUrl}`);
              },
              disconnect: () => {
                connection.isConnected = false;
                console.log(`[API] Disconnected from ${options.baseUrl}`);
              },
            };

            return connection;
          },
        },
        { provide: API_SERVICE, useClass: ApiService },
      ],
      exports: [API_SERVICE],
    });
  }
}
