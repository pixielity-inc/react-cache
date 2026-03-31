# Advanced DI Patterns Implementation

This document describes all the advanced patterns implemented in this example.

## 1. Dynamic Modules

### forRoot Pattern (ConfigModule)

**Purpose**: Configure a module at the root level with runtime options

**Implementation**: `.examples/vite/src/modules/config.module.ts`

```typescript
ConfigModule.forRoot({
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  environment: "development",
});
```

**Key Features**:

- Accepts configuration object at module import time
- Uses factory provider to inject config into service
- Singleton scope ensures config is shared app-wide

### forFeature Pattern (CacheModule)

**Purpose**: Feature-specific configuration that can be imported multiple times

**Implementation**: `.examples/vite/src/modules/cache.module.ts`

```typescript
CacheModule.forFeature({
  maxSize: 100,
  ttl: 60000, // 1 minute
});
```

**Key Features**:

- Can be imported multiple times with different configs
- Each import creates a separate cache instance
- Useful for feature modules with isolated state

### Async Factory Pattern (ApiModule)

**Purpose**: Create providers that require async initialization

**Implementation**: `.examples/vite/src/modules/api.module.ts`

```typescript
{
  provide: API_CONNECTION,
  useAsyncFactory: () => async (): Promise<ApiConnection> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const connection = { /* ... */ };
    return connection;
  },
}
```

**Key Features**:

- Async initialization before service is available
- Perfect for database connections, API clients
- Ensures resources are ready before injection

## 2. Service Scopes

### Singleton Scope (Default)

**Services**: ConfigService, LoggerService, CounterService, UserService

**Behavior**:

- One instance shared across entire application
- Created on first injection
- Lives for the lifetime of the app

**Use Cases**:

- Configuration services
- Logging services
- Shared state management
- Caching services

### Transient Scope

**Services**: RequestService, TransientService

**Implementation**: `.examples/vite/src/modules/scope.module.ts`

```typescript
{
  provide: TransientService,
  useClass: TransientService,
  scope: 'Transient',
}
```

**Behavior**:

- New instance created every time it's injected
- Each injection gets a unique instance
- No shared state between instances

**Use Cases**:

- Request-scoped services (in web apps)
- Stateless operations
- Isolated processing units
- Testing scenarios

## 3. Lifecycle Hooks

### onActivation Hook

**Purpose**: Initialize resources after instance creation

**Implementation**: `.examples/vite/src/modules/lifecycle.module.ts`

```typescript
{
  provide: LifecycleService,
  useClass: LifecycleService,
  onActivation: async (context, instance) => {
    await instance.onInit();
    return instance;
  },
}
```

**Use Cases**:

- Establish database connections
- Load configuration files
- Set up event listeners
- Validate instance state
- Async initialization

### onDeactivation Hook

**Purpose**: Clean up resources before instance destruction

```typescript
{
  provide: LifecycleService,
  useClass: LifecycleService,
  onDeactivation: (instance) => {
    instance.onDestroy();
  },
}
```

**Use Cases**:

- Close database connections
- Clean up file handles
- Remove event listeners
- Cancel pending operations
- Release resources

## 4. Testing Patterns

### Testable Service Design

**Service**: TestableService

**Implementation**: `.examples/vite/src/services/testable.service.ts`

**Key Principles**:

1. **Dependency Injection**: All dependencies injected via constructor

```typescript
constructor(
  @Inject(LoggerService) private logger: LoggerService,
  @Inject(CacheService) private cache: CacheService
) {}
```

2. **Pure Business Logic**: Separate business logic from dependencies

```typescript
calculateDiscount(price: number, userLevel: string): number {
  // Pure function - easy to test
  const discounts = { bronze: 0.05, silver: 0.1, gold: 0.15 };
  return price * (1 - discounts[userLevel]);
}
```

3. **Mockable Dependencies**: Easy to mock injected services

```typescript
// In tests
const mockLogger = { log: jest.fn(), error: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };
const service = new TestableService(mockLogger, mockCache);
```

### Testing Benefits

**Isolation**: Test services without their dependencies

```typescript
// Mock all dependencies
const service = new TestableService(mockLogger, mockCache);
expect(service.calculateDiscount(100, "gold")).toBe(85);
```

**Verification**: Verify interactions with dependencies

```typescript
service.fetchUserData("123");
expect(mockLogger.log).toHaveBeenCalledWith("Fetching user data for: 123");
expect(mockCache.get).toHaveBeenCalledWith("user:123");
```

**Integration Testing**: Test with real dependencies

```typescript
const realLogger = new LoggerService();
const realCache = new CacheService(config, realLogger);
const service = new TestableService(realLogger, realCache);
```

## 5. Symbol Tokens

**Purpose**: Type-safe injection tokens for non-class dependencies

**Examples**:

```typescript
export const API_CONNECTION = Symbol.for("API_CONNECTION");
export const CACHE_CONFIG = Symbol.for("CACHE_CONFIG");
export const CONFIG_OPTIONS = Symbol.for("CONFIG_OPTIONS");
```

**Benefits**:

- Type-safe injection
- Avoid string-based tokens
- Clear dependency contracts
- Better IDE support

## 6. Factory Providers

### Sync Factory

```typescript
{
  provide: ConfigService,
  useFactory: (context) => () => {
    const options = context.container.get<AppConfig>(CONFIG_OPTIONS);
    return new ConfigService(options);
  },
}
```

### Async Factory

```typescript
{
  provide: API_CONNECTION,
  useAsyncFactory: () => async () => {
    const connection = await createConnection();
    return connection;
  },
}
```

## Module Organization

```
modules/
├── app.module.ts          # Root module - imports all feature modules
├── config.module.ts       # Dynamic module with forRoot
├── api.module.ts          # Async factory module
├── cache.module.ts        # Feature module with forFeature
├── testing.module.ts      # Testing patterns module
├── lifecycle.module.ts    # Lifecycle hooks module
└── scope.module.ts        # Scope management module
```

## Best Practices

### 1. Module Design

- ✅ Use forRoot for root-level configuration
- ✅ Use forFeature for feature-specific configuration
- ✅ Export only what's needed
- ✅ Keep modules focused and cohesive

### 2. Service Design

- ✅ Inject dependencies via constructor
- ✅ Use appropriate scope (Singleton by default)
- ✅ Implement lifecycle hooks when needed
- ✅ Keep services testable

### 3. Lifecycle Management

- ✅ Use onActivation for initialization
- ✅ Use onDeactivation for cleanup
- ✅ Always return instance from onActivation
- ✅ Handle async operations properly

### 4. Testing

- ✅ Design services for testability
- ✅ Use dependency injection
- ✅ Separate business logic from dependencies
- ✅ Mock dependencies in tests

## Running the Examples

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Navigate to:
# - http://localhost:5173/container - Basic DI demo
# - http://localhost:5173/advanced - Advanced patterns demo
```

## Learn More

- [Main README](../../README.md)
- [Lifecycle Hooks Documentation](../../.docs/LIFECYCLE_HOOKS.md)
- [Inversiland Documentation](https://github.com/carlossalasamper/inversiland)
