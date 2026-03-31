# @abdokouta/react-di

## 2.0.0 (2026-03-31)

### 🚀 Breaking Changes

- **Container initialization moved outside React lifecycle** - `Inversiland.run()` must now be called BEFORE `ReactDOM.createRoot()` to properly support HMR
- **New `Container` builder API** - Fluent builder pattern for container configuration
- **`ContainerProvider` simplified** - No longer initializes the container, only provides context

### ✨ New Features

#### Container Builder API

New fluent builder pattern for initializing the DI container:

```typescript
import { Container } from "@abdokouta/react-di";

Container
  .configure()
  .withModule(AppModule)
  .withLogLevel("debug")
  .withDefaultScope("Singleton")
  .build();
```

Available methods:
- `.configure()` - Start configuration
- `.withModule(module)` - Set root module (required)
- `.withLogLevel(level)` - Set log level ("none" | "info" | "debug")
- `.withDefaultScope(scope)` - Set default scope ("Singleton" | "Transient" | "Request")
- `.withConfig(config)` - Pass config object directly
- `.withDefaults()` - Apply default config (logLevel: "info", defaultScope: "Singleton")
- `.withDevDefaults()` - Apply dev defaults (logLevel: "debug", defaultScope: "Singleton")
- `.build()` - Initialize the container

#### `initContainer` Utility

Alternative functional approach for container initialization:

```typescript
import { initContainer } from "@abdokouta/react-di";

initContainer({
  module: AppModule,
  logLevel: "debug",
  defaultScope: "Singleton",
});
```

### 🐛 Bug Fixes

- **Fixed HMR "Inversiland twice" error** - Container initialization now happens outside React's lifecycle, preventing re-initialization on hot module replacement
- **Fixed Global module provider resolution** - `@Global()` decorator now correctly moves providers to `globalProviders` regardless of decorator execution order
- **Fixed `ConfigModule.forRoot()` pattern** - Changed to `useValue` pattern for proper configuration injection
- **Fixed Symbol token injection** - Use `Symbol.for()` for DI tokens to survive HMR reloads

### 📝 Migration Guide

#### Before (v1.x)

```typescript
// main.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ContainerProvider module={AppModule} config={{ logLevel: "debug" }}>
    <App />
  </ContainerProvider>
);
```

#### After (v2.0)

```typescript
// main.tsx
import { Container, ContainerProvider } from "@abdokouta/react-di";

// Initialize BEFORE React renders
Container
  .configure()
  .withModule(AppModule)
  .withLogLevel(import.meta.env.DEV ? "debug" : "info")
  .withDefaultScope("Singleton")
  .build();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ContainerProvider module={AppModule}>
    <App />
  </ContainerProvider>
);
```

### 📦 Dependencies

- `inversiland` ^0.6.2
- `reflect-metadata` ^0.2.2

### 🙏 Acknowledgments

- Thanks to [@carlossalasamper](https://github.com/carlossalasamper) for the [Inversiland](https://github.com/inversiland/inversiland) library and the [react-clean-architecture](https://github.com/carlossalasamper/react-clean-architecture) reference implementation

---

## 1.0.4

- Minor bug fixes and improvements

## 1.0.3

- Documentation updates

## 1.0.2

- Fixed export issues

## 1.0.1

- Initial npm publish fixes

## 1.0.0 (Initial Release)

### Features

- ✨ NestJS-style module system for React
- 💉 Powerful dependency injection with decorators
- 🔄 Dynamic modules with `forRoot` and `forFeature` patterns
- ⚛️ React hooks (`useInject`, `useModule`)
- 📦 Hierarchical module structure
- 🎨 Full TypeScript support
- 🏗️ Built on Inversiland and InversifyJS

### Decorators

#### Core Decorators

- `@Module` - Define modules with imports, providers, and exports
- `@Injectable` - Mark classes as injectable
- `@Inject` - Inject dependencies (recommended default)
- `@MultiInject` - Inject multiple dependencies with same identifier
- `@Optional` - Mark dependencies as optional

#### Advanced Injection Decorators

- `@InjectProvided` - Inject only local providers (excludes imports)
- `@InjectImported` - Inject only imported providers (excludes local)
- `@MultiInjectProvided` - Multi-inject only local providers
- `@MultiInjectImported` - Multi-inject only imported providers

### React Hooks

- `useInject(token, module)` - Hook to inject services in components
- `useModule(module)` - Hook to access module container directly

### Utilities

- `forRoot(module, metadata)` - Create root-level dynamic modules
- `forFeature(module, metadata)` - Create feature-level dynamic modules
- `createModuleFactory(module, metadata)` - Generic module factory helper

### Type Definitions

- `ModuleMetadata` - Module configuration interface
- `DynamicModule` - Dynamic module return type
- `Provider` - Union of all provider types
- `ClassProvider` - Class-based provider
- `ValueProvider` - Value-based provider
- `FactoryProvider` - Factory function provider
- `AsyncFactoryProvider` - Async factory provider
- `ExistingProvider` - Alias provider
- `ServiceIdentifier` - Service token type
- `Scope` - Provider lifecycle scope
- `LogLevel` - Logging verbosity level

### Dependencies

- `inversiland` ^0.6.2 - Core DI framework
- `reflect-metadata` ^0.2.0 - Metadata reflection support

### Peer Dependencies

- `react` ^18.0.0 - React framework
