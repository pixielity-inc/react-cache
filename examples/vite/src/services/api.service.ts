import { Injectable, Inject } from "@abdokouta/react-di";
import { LOGGER_SERVICE } from "@/constants";

export const API_CONNECTION = Symbol.for("API_CONNECTION");

export interface ApiConnection {
  baseUrl: string;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

@Injectable()
export class ApiService {
  constructor(
    @Inject(API_CONNECTION) private connection: ApiConnection,
    @Inject(LOGGER_SERVICE) private logger: any,
  ) {
    this.logger.info("ApiService initialized with connection");
  }

  async fetchData<T>(endpoint: string): Promise<T> {
    if (!this.connection.isConnected) {
      await this.connection.connect();
    }

    this.logger.log(`Fetching data from ${this.connection.baseUrl}${endpoint}`);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: "mock data" } as T);
      }, 500);
    });
  }

  getConnectionStatus(): boolean {
    return this.connection.isConnected;
  }

  getBaseUrl(): string {
    return this.connection.baseUrl;
  }
}
