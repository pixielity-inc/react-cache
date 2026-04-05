# Manager Pattern for TypeScript Packages

## Overview

This document describes the reusable Manager pattern used across all packages
in this monorepo. It is a TypeScript adaptation of Laravel's `CacheManager`
and `MultipleInstanceManager` patterns.

The pattern solves a common problem: a package needs to support multiple
named instances of a service, each backed by a different driver, with lazy
initialization, caching, and extensibility.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CacheService                            │
│  (base class — pure cache operations)                       │
│                                                             │
│  # _store: Store          (set by manager)                  │
│  # _defaultTtl: number    (set by manager)                  │
│                                                             │
│  + get, put, has, forget, flush                             │
│  + remember, rememberForever, pull, add                     │
│  + many, putMany, forever, increment, decrement             │
│  + tags (Redis only)                                        │
│  + setTtl, withTtl                                          │
│  + static create(store, ttl) → CacheService                 │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ extends
                          │
┌─────────────────────────────────────────────────────────────┐
│                     CacheManager                            │
│  (extends CacheService — adds store management)             │
│                                                             │
│  Inherits ALL cache methods from CacheService               │
│  (TypeScript equivalent of Laravel's __call() proxy)        │
│                                                             │
│  + store(name?) → CacheService                              │
│  + getDefaultDriver() → string                              │
│  + getStoreNames() → string[]                               │
│  + hasStore(name) → boolean                                 │
│  + extend(driver, factory) → this                           │
│  + forgetDriver(name?) → void                               │
│  + purge() → void                                           │
│                                                             │
│  - resolveStore(name) → Store  (lazy, cached)               │
│  - createMemoryDriver, createRedisDriver, createNullDriver  │
│  - buildPrefix(config) → string                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Inheritance over Proxy

Laravel uses `__call()` to forward unknown method calls from the manager
to the default store's repository. TypeScript doesn't have `__call()`.

We considered three approaches:
1. **Proxy object** — `new Proxy(manager, ...)` to forward calls. Loses type safety.
2. **Explicit proxy methods** — 15+ one-liner methods on the manager. Boilerplate.
3. **Inheritance** — Manager extends Service. Zero boilerplate, full type safety.

We chose **inheritance**. The manager IS a service. All cache methods
(get, put, remember, etc.) are inherited and operate on the default store.

### No _manager reference on CacheService

The `CacheService` is a pure cache operations class. It doesn't know about
the manager. The `store()` method lives only on `CacheManager`.

When the manager creates a child `CacheService` (via `store('redis')`),
it uses `CacheService.create(store, ttl)` — a static factory method.
The child service has no reference back to the manager.

If users need `store()` on a child service, they should hold a reference
to the manager separately.

### Config is pure data, injected via DI

Config objects are plain JSON-serializable data. No class instances, no
connections. Connection names are strings resolved at runtime by factories.

The config is registered as a DI provider under a `CONFIG` token, and
the manager receives it via `@Inject(CONFIG_TOKEN)` in its constructor.

```typescript
// Config definition (pure data)
defineConfig({
  default: 'memory',
  stores: {
    memory: { driver: 'memory', maxSize: 1000, ttl: 300 },
    redis:  { driver: 'redis', connection: 'cache', prefix: 'c_' },
    null:   { driver: 'null' },
  },
  prefix: 'app_',
});

// Manager receives config via DI
@Injectable()
class CacheManager extends CacheService {
  constructor(@Inject(CACHE_CONFIG) config: CacheModuleOptions) {
    super();
    this._store = this.resolveStore(config.default);
    this._defaultTtl = config.stores[config.default]?.ttl ?? 300;
  }
}
```

### Lazy store resolution

Stores are created on first access and cached in a `Map<string, Store>`.
Calling `store('redis')` twice returns the same underlying Store instance
(wrapped in a new lightweight CacheService each time).

### Custom drivers via extend()

Users can register custom drivers without modifying the package:

```typescript
cache.extend('dynamodb', (config, prefix) => {
  return new DynamoStore(config.table, config.region, prefix);
});

// Now usable in config
defineConfig({
  stores: {
    dynamo: { driver: 'dynamodb', table: 'cache', region: 'us-east-1' },
  },
});
```

## How It Works

### 1. Module registers providers

```typescript
@Module({})
export class CacheModule {
  static forRoot(config: CacheModuleOptions): DynamicModule {
    const manager = new CacheManager(config);

    return {
      module: CacheModule,
      providers: [
        { provide: CACHE_CONFIG, useValue: config, isGlobal: true },
        { provide: CACHE_MANAGER, useValue: manager, isGlobal: true },
        { provide: CACHE_SERVICE, useValue: manager, isGlobal: true },
        //                                  ^^^^^^^ manager IS a CacheService
      ],
      exports: [CACHE_SERVICE, CACHE_MANAGER, CACHE_CONFIG],
    };
  }
}
```

Note: `CACHE_SERVICE` and `CACHE_MANAGER` point to the same instance.
`CACHE_SERVICE` is typed as `CacheService` (cache ops only).
`CACHE_MANAGER` is typed as `CacheManager` (cache ops + management).

### 2. Users inject and use

```typescript
// Most common — just cache operations
const cache = useInject<CacheService>(CACHE_SERVICE);
await cache.remember('user:1', 3600, () => fetchUser(1));

// Store switching
await cache.store('redis').put('key', 'value');  // works because it's a CacheManager

// TTL control
await cache.withTtl(60).put('temp', 'data');

// Need manager methods explicitly
const manager = useInject<CacheManager>(CACHE_MANAGER);
manager.getStoreNames();  // ['memory', 'redis', 'null']
manager.extend('custom', factory);
```

### 3. React hooks

```typescript
const cache = useCache();           // default store
const redis = useCache('redis');    // specific store
```

## Applying to Other Packages

The same pattern works for any multi-driver service:

### Redis Package (RedisManager)

```typescript
class RedisService {
  protected _connection!: RedisConnection;
  async get(key: string) { ... }
  async set(key: string, value: string) { ... }
}

class RedisManager extends RedisService {
  constructor(@Inject(REDIS_CONFIG) config) { ... }
  connection(name?: string): RedisService { ... }
  // Inherits get, set, etc. operating on default connection
}
```

### Mail Package (MailManager)

```typescript
class MailService {
  protected _transport!: Transport;
  async send(message: Message) { ... }
}

class MailManager extends MailService {
  constructor(@Inject(MAIL_CONFIG) config) { ... }
  mailer(name?: string): MailService { ... }
  // Inherits send() operating on default transport
}
```

## DI Token Convention

Each package follows the same three-token pattern:

| Token | Type | Description |
|---|---|---|
| `*_CONFIG` | Config object | Raw config data |
| `*_MANAGER` | Manager class | Full API (cache ops + management) |
| `*_SERVICE` | Service class | Cache ops only (same instance as manager) |

## File Structure Convention

```
src/
├── constants/
│   └── tokens.constant.ts       # DI tokens
├── interfaces/
│   └── *.interface.ts            # All contracts
├── services/
│   ├── cache-manager.service.ts  # Concrete manager (extends service)
│   └── cache.service.ts          # Pure cache operations (base class)
├── stores/                       # Driver implementations
│   ├── memory.store.ts
│   ├── redis.store.ts
│   └── null.store.ts
├── cache.module.ts               # DI module with forRoot()
└── index.ts                      # Public exports
```

The abstract `MultipleInstanceManager` base class lives in
`@abdokouta/react-support` and can be used by any package that needs
the multi-instance, multi-driver pattern. The cache package uses it
as a reference pattern but manages stores directly via `CacheManager`
(which extends `CacheService` for inheritance-based method forwarding).
