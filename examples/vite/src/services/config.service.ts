import { Injectable } from "@abdokouta/react-di";

export interface AppConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
  environment: "development" | "production" | "test";
}

@Injectable()
export class ConfigService {
  constructor(private config: AppConfig) {}

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.environment === "production";
  }
}
