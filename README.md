<p align="center">
  <img src="./.github/assets/banner.svg" alt="@abdokouta/react-cache" width="100%" />
</p>

<h1 align="center">@abdokouta/react-cache</h1>

<p align="center">
  <strong>Laravel-inspired caching system with multiple drivers for React</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@abdokouta/react-cache"><img src="https://img.shields.io/npm/v/@abdokouta/react-cache.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@abdokouta/react-cache"><img src="https://img.shields.io/npm/dm/@abdokouta/react-cache.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/pixielity-inc/react-cache/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@abdokouta/react-cache.svg?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  Memory • Redis • Null drivers • Tags • MultipleInstanceManager • DI Integration • React Hooks
</p>

---

## What is this?

A multi-driver caching system for React apps. Manage multiple named cache stores (memory, redis, null) with a unified API. Built on `MultipleInstanceManager` from `@abdokouta/react-support` and integrates with `@abdokouta/ts-container` for NestJS-style dependency injection.

Inspired by Laravel's Cache system — same patterns, same DX, built for the browser.

## Features

- Multiple named stores (memory, redis, null) — switch at runtime
- `CacheManager` extends `MultipleInstanceManager` for lazy store creation
- `CacheService` wraps stores with `remember()`, `tags()`, `pull()`, `forever()`
- Redis driver via `@abdokouta/react-redis` (Upstash HTTP)
- Cache tagging for organized invalidation (Redis only)
- `OnModuleInit` / `OnModuleDestroy` lifecycle hooks
- Custom driver registration via `extend()`
- React hooks: `useCache()`, `useCachedQuery()`
- Full TypeScript support

## Installation

```bash
pnpm add @abdokouta/react-cache @abdokouta/ts-container @abdokouta/react-support reflect-metadata
```

For Redis driver, also install:

```bash
pnpm add @abdokouta/react-redis
```

For React hooks:

```bash
pnpm add @abdokouta/ts-container-react
```

## Quick Start

### 1. Configure stores

```typescript
// config/cache.config.ts
import { defineConfig } from '@abdokouta/react-cache';

export default defineConfig({
  default: 'memory',
  stores: {
    memory: {
      driver: 'memory',
      maxSize: 1000,
      ttl: 300,
      prefix: 'mem_',
    },
    redis: {
      driver: 'redis',
      connection: 'cache',
      prefix: 'cache_',
      ttl: 3600,
    },
    null: {
      driver: 'null',
    },
  },
  prefix: 'app_',
});
```

### 2. Register the module

```typescript
import { Module } from '@abdokouta/ts-container';
import { CacheModule } from '@abdokouta/react-cache';
import { RedisModule } from '@abdokouta/react-redis';
import cacheConfig from './config/cache.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    // Redis must be imported BEFORE Cache if using redis driver
    RedisModule.forRoot(redisConfig),
    CacheModule.forRoot(cacheConfig),
  ],
})
export class AppModule {}
```

### 3. Use in services

```typescript
import { Injectable, Inject } from '@abdokouta/ts-container';
import { CacheManager, CACHE_MANAGER } from '@abdokouta/react-cache';

@Injectable()
export class UserService {
  constructor(@Inject(CACHE_MANAGER) private cache: CacheManager) {}

  async getUser(id: string) {
    return this.cache.store().remember(`user:${id}`, 3600, async () => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    });
  }

  async clearUserCache() {
    await this.cache.store('redis').tags(['users']).flush();
  }
}
```

### 4. Use in React components

```tsx
import { useCache } from '@abdokouta/react-cache';

function UserProfile({ userId }: { userId: string }) {
  const cache = useCache();

  const handleClear = async () => {
    await cache.forget(`user:${userId}`);
  };

  return <button onClick={handleClear}>Clear Cache</button>;
}
```

## API

### CacheModule

```typescript
CacheModule.forRoot(config: CacheModuleOptions): DynamicModule
```

Registers the `CacheManager` and config as providers.

### CacheManager

The central orchestrator. Extends `MultipleInstanceManager<Store>`.

| Method | Description |
|---|---|
| `store(name?)` | Get a `CacheService` for a named store |
| `getDefaultDriver()` | Default store name |
| `getStoreNames()` | All configured store names |
| `hasStore(name)` | Check if a store is configured |
| `getGlobalPrefix()` | Global cache key prefix |
| `forgetStore(name?)` | Remove cached store, force re-creation |
| `purge()` | Clear all cached stores |
| `extend(driver, creator)` | Register a custom store driver |

### CacheService

The consumer-facing API returned by `manager.store()`.

| Method | Description |
|---|---|
| `get(key, default?)` | Get a value |
| `put(key, value, ttl?)` | Store a value |
| `has(key)` | Check if key exists |
| `forget(key)` | Remove a key |
| `flush()` | Clear all keys |
| `remember(key, ttl, callback)` | Get or compute and store |
| `rememberForever(key, callback)` | Get or compute and store forever |
| `pull(key, default?)` | Get and remove |
| `add(key, value, ttl?)` | Store only if key doesn't exist |
| `forever(key, value)` | Store without expiration |
| `increment(key, value?)` | Increment a counter |
| `decrement(key, value?)` | Decrement a counter |
| `many(keys)` | Get multiple values |
| `putMany(values, ttl?)` | Store multiple values |
| `tags(names)` | Get tagged cache (Redis only) |

### Store Drivers

| Driver | Class | Description |
|---|---|---|
| `memory` | `MemoryStore` | In-memory with LRU eviction |
| `redis` | `RedisStore` | Redis via `@abdokouta/react-redis` |
| `null` | `NullStore` | No-op for testing |

### React Hooks

| Hook | Description |
|---|---|
| `useCache(storeName?)` | Get a `CacheService` for a store |
| `useCachedQuery(options)` | Cache async query results with loading/error states |

### DI Tokens

| Token | Description |
|---|---|
| `CACHE_CONFIG` | The configuration object |
| `CACHE_MANAGER` | The CacheManager instance |
| `CACHE_SERVICE` | Alias for CacheManager |

## Configuration

```typescript
interface CacheModuleOptions {
  default: string;                    // Default store name
  stores: Record<string, StoreConfig>; // Store configurations
  prefix?: string;                    // Global key prefix
  isGlobal?: boolean;                 // Register globally
}

// Memory store
interface MemoryStoreConfig {
  driver: 'memory';
  maxSize?: number;    // Max entries (LRU eviction)
  ttl?: number;        // Default TTL in seconds
  prefix?: string;     // Store-specific prefix
}

// Redis store
interface RedisStoreConfig {
  driver: 'redis';
  connection: string;  // Redis connection name
  ttl?: number;
  prefix?: string;
}

// Null store
interface NullStoreConfig {
  driver: 'null';
  prefix?: string;
}
```

## Cache Tags (Redis only)

```typescript
const cache = manager.store('redis');

// Store with tags
const tagged = await cache.tags(['users', 'premium']);
await tagged.put('user:123', userData, 3600);

// Flush all entries with specific tags
await cache.tags(['users']).flush();
```

## Custom Drivers

```typescript
manager.extend('localStorage', (config) => {
  return new LocalStorageStore(config);
});

const local = manager.store('localStorage');
await local.put('key', 'value');
```

## Lifecycle

The `CacheManager` implements lifecycle hooks:

- `OnModuleInit` — eagerly creates the default store
- `OnModuleDestroy` — flushes all stores on `app.close()`

## Environment Variables

```env
VITE_CACHE_DRIVER=memory
VITE_CACHE_PREFIX=app_
VITE_CACHE_MEMORY_MAX_SIZE=1000
VITE_CACHE_MEMORY_TTL=300
VITE_CACHE_REDIS_PREFIX=cache_
VITE_CACHE_REDIS_TTL=3600
VITE_REDIS_CACHE_CONNECTION=cache
```

## License

MIT

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/abdokouta">Abdo Kouta</a> at <a href="https://github.com/pixielity-inc">Pixielity</a>
</p>
