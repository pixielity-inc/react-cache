import { Injectable, Inject } from "@abdokouta/react-di";
import { CACHE_CONFIG, LOGGER_SERVICE } from "@/constants";

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(
    @Inject(CACHE_CONFIG) private config: CacheConfig,
    @Inject(LOGGER_SERVICE) private logger: any,
  ) {
    this.logger.info(
      `CacheService initialized with maxSize: ${config.maxSize}, ttl: ${config.ttl}ms`,
    );
  }

  set<T>(key: string, value: T): void {
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.logger.log(`Cache full, evicted key: ${firstKey}`);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
    this.logger.log(`Cached value for key: ${key}`);
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.logger.log(`Cache miss for key: ${key}`);
      return undefined;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.config.ttl) {
      this.cache.delete(key);
      this.logger.log(`Cache expired for key: ${key}`);
      return undefined;
    }

    this.logger.log(`Cache hit for key: ${key}`);
    return entry.value;
  }

  clear(): void {
    this.cache.clear();
    this.logger.log("Cache cleared");
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
    };
  }
}
