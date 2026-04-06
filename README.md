<p align="center">
  <img src="./assets/banner.svg" alt="@abdokouta/ts-container" width="100%" />
</p>

<h1 align="center">@abdokouta/ts-container</h1>

<p align="center">
  <strong>Powerful dependency injection for React with NestJS-style modules</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@abdokouta/ts-container"><img src="https://img.shields.io/npm/v/@abdokouta/ts-container.svg?style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@abdokouta/ts-container"><img src="https://img.shields.io/npm/dm/@abdokouta/ts-container.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/abdokouta/ts-container/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@abdokouta/ts-container.svg?style=flat-square" alt="license" /></a>
  <a href="https://github.com/abdokouta/ts-container"><img src="https://img.shields.io/github/stars/abdokouta/ts-container?style=flat-square" alt="GitHub stars" /></a>
</p>

<p align="center">
  Built on top of <a href="https://github.com/inversiland/inversiland">Inversiland</a> • TypeScript-first • Zero boilerplate
</p>

---

## ✨ Features

- 🎯 **NestJS-style modules** - Familiar patterns for organizing your React app
- 💉 **Powerful DI** - Constructor injection with decorators
- 🔄 **Dynamic modules** - `forRoot` and `forFeature` patterns
- ⚛️ **React hooks** - `useInject` for seamless component integration
- 🌍 **Global modules** - Share services across your entire app
- 🔥 **HMR support** - Works perfectly with Vite hot module replacement
- 📦 **Tree-shakeable** - Only bundle what you use
- 🎨 **TypeScript-first** - Full type safety and IntelliSense

## 📦 Installation

```bash
npm install @abdokouta/ts-container reflect-metadata
```

## 🚀 Quick Start

### 1. Initialize the Container

```typescript
// main.tsx
import "reflect-metadata";
import { Container, ContainerProvider } from "@abdokouta/ts-container";
import { AppModule } from "./modules/app.module";

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

### 2. Create Services

```typescript
import { Injectable, Inject } from '@abdokouta/ts-container';

@Injectable()
export class LoggerService {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

@Injectable()
export class UserService {
  constructor(@Inject(LoggerService) private logger: LoggerService) {}

  getUsers() {
    this.logger.log('Fetching users...');
    return [{ id: 1, name: 'John' }];
  }
}
```

### 3. Create Modules

```typescript
import { Module } from '@abdokouta/ts-container';

@Module({
  providers: [LoggerService, UserService],
})
export class AppModule {}
```

### 4. Use in Components

```typescript
import { useInject } from "@abdokouta/ts-container";

export function UserList() {
  const userService = useInject(UserService);
  const users = userService.getUsers();

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## 🏗️ Container Builder API

```typescript
// Full configuration
Container.configure()
  .withModule(AppModule)
  .withLogLevel('debug')
  .withDefaultScope('Singleton')
  .build();

// With config object
Container.configure()
  .withModule(AppModule)
  .withConfig({ logLevel: 'debug', defaultScope: 'Singleton' })
  .build();

// With defaults
Container.configure().withModule(AppModule).withDefaults().build();
```

## 🌍 Global Modules

```typescript
import { Module, Global } from '@abdokouta/ts-container';

@Global()
@Module({
  providers: [LoggerService],
})
export class LoggerModule {}
```

## 🔄 Dynamic Modules

```typescript
import { Module, forRoot, type DynamicModule } from '@abdokouta/ts-container';

@Module({})
export class ConfigModule {
  static forRoot(config: AppConfig): DynamicModule {
    return forRoot(ConfigModule, {
      providers: [{ provide: CONFIG, useValue: config }],
      exports: [ConfigService],
    });
  }
}
```

## 📋 Provider Types

| Type          | Example                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| Class         | `UserService` or `{ provide: USER, useClass: UserService }`              |
| Value         | `{ provide: API_URL, useValue: "https://api.example.com" }`              |
| Factory       | `{ provide: CONNECTION, useFactory: (ctx) => () => createConnection() }` |
| Async Factory | `{ provide: DB, useAsyncFactory: () => async () => await connect() }`    |
| Alias         | `{ provide: "Logger", useExisting: LoggerService }`                      |

## 🎣 React Hooks

| Hook                  | Description           |
| --------------------- | --------------------- |
| `useInject<T>(token)` | Inject a service      |
| `useContainer()`      | Get container context |
| `useModule(module)`   | Get module container  |

## 🔧 Decorators

| Decorator             | Description              |
| --------------------- | ------------------------ |
| `@Module()`           | Define a module          |
| `@Global()`           | Make module global       |
| `@Injectable()`       | Mark class as injectable |
| `@Inject(token)`      | Inject dependency        |
| `@MultiInject(token)` | Inject all with token    |
| `@Optional()`         | Optional dependency      |

## 📚 Documentation

- [Full Documentation](./packages/container/README.md)
- [Examples](./examples/vite)
- [API Reference](./packages/container/README.md#-decorators)

## 📄 License

MIT © [Abdo Kouta](https://github.com/abdokouta)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/abdokouta">Abdo Kouta</a>
</p>
