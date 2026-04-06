# App Cache Demo

This example demonstrates the `@abdokouta/ts-container` dependency injection
container with comprehensive patterns and use cases.

## Features Demonstrated

### 1. Basic DI Container (`/container`)

- **Singleton Services**: LoggerService, CounterService, UserService
- **Dependency Injection**: Services injecting other services
- **React Integration**: Using `useInject()` hook in components
- **State Management**: Reactive services with subscriptions
- **CRUD Operations**: User management with injected services

### 2. Advanced Patterns (`/advanced`)

#### Dynamic Modules

- **forRoot Pattern**: ConfigModule with runtime configuration
- **forFeature Pattern**: CacheModule with feature-specific config
- **Async Factory**: ApiModule with async connection initialization

#### Service Scopes

- **Singleton** (default): Same instance across the app
- **Transient**: New instance per injection
- **Request Scope**: Simulated request-scoped services

#### Lifecycle Hooks

- **onInit()**: Async initialization, resource allocation
- **onDestroy()**: Cleanup, connection closing

#### Testing Patterns

- **Testable Services**: Designed for easy mocking
- **Dependency Mocking**: Mock LoggerService, CacheService
- **Business Logic Isolation**: Pure functions easy to test

## Project Structure

```
src/
├── services/           # Injectable services
│   ├── logger.service.ts       # Logging service (singleton)
│   ├── counter.service.ts      # Counter with subscriptions
│   ├── user.service.ts         # User CRUD operations
│   ├── config.service.ts       # Configuration service
│   ├── api.service.ts          # API with async connection
│   ├── cache.service.ts        # Caching service
│   ├── testable.service.ts     # Service designed for testing
│   ├── request.service.ts      # Request-scoped service
│   ├── transient.service.ts    # Transient-scoped service
│   └── lifecycle.service.ts    # Service with lifecycle hooks
│
├── modules/            # DI modules
│   ├── app.module.ts           # Root module
│   ├── config.module.ts        # Dynamic module with forRoot
│   ├── api.module.ts           # Async factory module
│   ├── cache.module.ts         # Feature module with forFeature
│   ├── testing.module.ts       # Testing patterns module
│   ├── lifecycle.module.ts     # Lifecycle hooks module
│   └── scope.module.ts         # Scope management module
│
└── pages/              # Demo pages
    ├── index.tsx               # Landing page
    ├── container.tsx           # Basic DI demo
    └── advanced.tsx            # Advanced patterns demo
```

## Key Concepts

### Module System

Modules organize providers and their dependencies:

```typescript
@Module({
  imports: [OtherModule],
  providers: [MyService],
  exports: [MyService],
})
export class MyModule {}
```

### Dynamic Modules

**forRoot** - Root-level configuration:

```typescript
ConfigModule.forRoot({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
});
```

**forFeature** - Feature-specific configuration:

```typescript
CacheModule.forFeature({
  maxSize: 100,
  ttl: 60000,
});
```

### Async Factories

For services requiring async initialization:

```typescript
{
  provide: API_CONNECTION,
  useAsyncFactory: () => async () => {
    const connection = await createConnection();
    return connection;
  },
}
```

### Service Scopes

**Singleton** (default):

```typescript
@Injectable()
export class MySingletonService {}
```

**Transient**:

```typescript
{
  provide: MyService,
  useClass: MyService,
  scope: "Transient",
}
```

### Lifecycle Hooks

```typescript
@Injectable()
export class MyService {
  async onInit() {
    // Initialize resources
  }

  onDestroy() {
    // Cleanup resources
  }
}
```

### Testing

Services are designed for easy testing:

```typescript
// Mock dependencies
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
};

// Test service with mocked dependencies
const service = new MyService(mockLogger);
```

## Running the Demo

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Learn More

- [Main Documentation](../../README.md)
- [Inversiland](https://github.com/inversiland/inversiland)
- [NestJS Modules](https://docs.nestjs.com/modules)
