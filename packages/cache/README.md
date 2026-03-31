# @abdokouta/cache

Laravel-inspired caching system for Refine with multiple drivers and cache tagging support.

## Features

- **Multiple Drivers**: Memory, Redis (Upstash), and Null stores
- **Cache Tagging**: Group and invalidate related cache items (Redis only)
- **Repository Pattern**: Laravel-style high-level API with `remember()`, `rememberForever()`, etc.
- **React Hooks**: `useCache()` and `useCachedQuery()` for easy integration
- **TypeScript**: Full type safety with comprehensive JSDoc documentation
- **Browser Compatible**: Works in browsers using Upstash Redis HTTP API

## Installation

```bash
npm install @abdokouta/cache
# or
yarn add @abdokouta/cache
# or
pnpm add @abdokouta/cache
```

### Optional Dependencies

For Redis support:
```bash
npm install @abdokouta/redis @upstash/redis
```

For React hooks:
```bash
npm install react
```

## Quick Start

### 1. Configure the Module

```typescript
import { Module } from '@abdokouta/container';
import { CacheModule } from '@abdokouta/cache';

@Module({
  imports: [
    CacheModule.forRoot({
      default: 'memory',
      stores: {
        memory: {
          driver: 'memory',
          maxSize: 1000,
          ttl: 300, // 5 minutes
        },
        null: {
          driver: 'null',
        },
      },
      prefix: 'myapp_',
    }),
  ],
})
export class AppModule {}
```

### 2. Use in Services

```typescript
import { Injectable, Inject } from '@abdokouta/container';
import { CacheService } from '@abdokouta/cache';

@Injectable()
export class UserService {
  constructor(
    @Inject(CacheService) private cache: CacheService
  ) {}

  async getUser(id: string) {
    // Remember pattern: get from cache or execute callback
    return this.cache.remember(`user:${id}`, 3600, async () => {
      return await this.database.users.findById(id);
    });
  }

  async invalidateUser(id: string) {
    await this.cache.forget(`user:${id}`);
  }
}
```

### 3. Use in React Components

```typescript
import { useCache } from '@abdokouta/cache';

function UserProfile({ userId }: { userId: string }) {
  const cache = useCache();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const cached = await cache.get(`user:${userId}`);
      
      if (cached) {
        setUser(cached);
      } else {
        const user = await fetchUser(userId);
        await cache.put(`user:${userId}`, user, 3600);
        setUser(user);
      }
    }
    
    loadUser();
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

## Cache Drivers

### Memory Store

In-memory cache with TTL and LRU eviction.

```typescript
CacheModule.forRoot({
  default: 'memory',
  stores: {
    memory: {
      driver: 'memory',
      maxSize: 1000,    // Max items (LRU eviction)
      ttl: 300,         // Default TTL in seconds
      prefix: 'cache_',
    },
  },
})
```

**Use Cases:**
- Development/testing
- Client-side caching in browsers
- Temporary session data
- When persistence is not required

### Redis Store

Redis-backed cache with tagging support (requires @abdokouta/redis).

```typescript
import { RedisModule } from '@abdokouta/redis';

@Module({
  imports: [
    // Configure Redis first
    RedisModule.forRoot({
      default: 'cache',
      connections: {
        cache: {
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        },
      },
    }),
    
    // Then configure Cache
    CacheModule.forRoot({
      default: 'redis',
      stores: {
        redis: {
          driver: 'redis',
          connection: 'cache',
          prefix: 'app_',
          ttl: 3600,
        },
      },
    }),
  ],
})
```

**Use Cases:**
- Production applications
- Distributed systems
- When cache persistence is required
- When cache tagging is needed

### Null Store

No-op cache that doesn't store anything.

```typescript
CacheModule.forRoot({
  default: 'null',
  stores: {
    null: {
      driver: 'null',
    },
  },
})
```

**Use Cases:**
- Disabling cache in testing
- Development environments
- Feature flags to disable caching

## API Reference

### CacheService

Main service for cache operations.

#### Basic Operations

```typescript
// Get
const value = await cache.get('key');
const valueWithDefault = await cache.get('key', 'default');

// Put
await cache.put('key', 'value', 3600); // TTL in seconds

// Put many
await cache.putMany({
  'key1': 'value1',
  'key2': 'value2',
}, 3600);

// Forever (no expiration)
await cache.forever('key', 'value');

// Forget
await cache.forget('key');

// Flush all
await cache.flush();

// Check existence
const exists = await cache.has('key');
```

#### Remember Pattern

Get from cache or execute callback and store result:

```typescript
const user = await cache.remember('user:123', 3600, async () => {
  return await database.users.findById(123);
});

// Forever variant
const config = await cache.rememberForever('app:config', async () => {
  return await loadConfigFromFile();
});
```

#### Increment/Decrement

```typescript
await cache.increment('page:views');        // +1
await cache.increment('page:views', 10);    // +10
await cache.decrement('stock:item:123');    // -1
await cache.decrement('stock:item:123', 5); // -5
```

#### Pull (Get and Delete)

```typescript
const token = await cache.pull('auth:token:abc123');
// Token is now removed from cache
```

#### Multiple Stores

```typescript
// Use specific store
const memoryCache = cache.store('memory');
await memoryCache.put('key', 'value', 300);

// Use default store
await cache.put('key', 'value', 300);
```

### Cache Tagging (Redis Only)

Group related cache items and invalidate them together:

```typescript
// Store with tags
await cache.tags(['users', 'premium']).put('user:123', user, 3600);
await cache.tags(['users', 'premium']).put('user:456', user2, 3600);

// Retrieve with tags
const user = await cache.tags(['users', 'premium']).get('user:123');

// Flush all items with specific tags
await cache.tags(['premium']).flush(); // Invalidates all premium users

// Multiple operations
const taggedCache = cache.tags(['users', 'posts']);
await taggedCache.put('user:1:posts', posts, 3600);
await taggedCache.increment('user:1:post_count');
await taggedCache.flush(); // Flush all user posts
```

### React Hooks

#### useCache

Access cache service in React components:

```typescript
import { useCache } from '@abdokouta/cache';

function MyComponent() {
  const cache = useCache();
  
  // Use default store
  const handleCache = async () => {
    await cache.put('key', 'value', 3600);
  };
  
  // Use specific store
  const memoryCache = useCache('memory');
  
  return <button onClick={handleCache}>Cache Data</button>;
}
```

#### useCachedQuery

Automatic caching of async query results:

```typescript
import { useCachedQuery } from '@abdokouta/cache';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, refetch, invalidate } = useCachedQuery({
    key: `user:${userId}`,
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    ttl: 3600, // Cache for 1 hour
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refetch}>Refresh</button>
      <button onClick={invalidate}>Clear Cache & Refresh</button>
    </div>
  );
}
```

**Options:**
- `key`: Cache key
- `queryFn`: Function to execute on cache miss
- `ttl`: TTL in seconds (default: 300)
- `storeName`: Store name (default: default store)
- `enabled`: Enable/disable query (default: true)
- `refetchOnMount`: Refetch on mount (default: false)

**Result:**
- `data`: Query data
- `isLoading`: Loading state
- `error`: Error state
- `refetch()`: Refetch from cache or query
- `invalidate()`: Clear cache and refetch

## Configuration

### CacheModuleOptions

```typescript
interface CacheModuleOptions {
  /** Default store name */
  default: string;
  
  /** Store configurations */
  stores: Record<string, StoreConfig>;
  
  /** Global cache key prefix */
  prefix?: string;
}
```

### StoreConfig

```typescript
// Memory Store
interface MemoryStoreConfig {
  driver: 'memory';
  maxSize?: number;  // Max items (LRU eviction)
  ttl?: number;      // Default TTL in seconds
  prefix?: string;   // Store-specific prefix
}

// Redis Store
interface RedisStoreConfig {
  driver: 'redis';
  connection?: string;  // Redis connection name
  ttl?: number;         // Default TTL in seconds
  prefix?: string;      // Store-specific prefix
}

// Null Store
interface NullStoreConfig {
  driver: 'null';
  prefix?: string;
}
```

## Advanced Usage

### Custom Store Selection

```typescript
@Injectable()
export class StatsService {
  constructor(
    @Inject(CacheService) private cache: CacheService
  ) {}

  async getStats() {
    // Use memory cache for fast access
    const memoryCache = this.cache.store('memory');
    return memoryCache.remember('stats', 60, async () => {
      return await this.calculateStats();
    });
  }

  async getPersistentData() {
    // Use Redis for persistent cache
    const redisCache = this.cache.store('redis');
    return redisCache.get('persistent:data');
  }
}
```

### Conditional Caching

```typescript
const cacheEnabled = process.env.CACHE_ENABLED === 'true';

CacheModule.forRoot({
  default: cacheEnabled ? 'memory' : 'null',
  stores: {
    memory: { driver: 'memory' },
    null: { driver: 'null' },
  },
})
```

### Cache Invalidation Patterns

```typescript
// Single item
await cache.forget('user:123');

// Multiple items
await cache.forget('user:123');
await cache.forget('user:123:posts');
await cache.forget('user:123:comments');

// Tagged items (Redis only)
await cache.tags(['users']).flush();

// All cache
await cache.flush();
```

## Best Practices

1. **Use Descriptive Keys**: Use namespaced keys like `user:123`, `post:456:comments`
2. **Set Appropriate TTLs**: Balance freshness vs. performance
3. **Use Tags for Related Data**: Group related items for easy invalidation (Redis)
4. **Handle Cache Misses**: Always provide fallback logic
5. **Monitor Cache Size**: Set `maxSize` for memory stores to prevent memory leaks
6. **Use Remember Pattern**: Simplifies cache-or-compute logic
7. **Invalidate on Updates**: Clear cache when data changes

## Examples

### User Profile Caching

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(CacheService) private cache: CacheService,
    @Inject(Database) private db: Database
  ) {}

  async getUser(id: string) {
    return this.cache.remember(`user:${id}`, 3600, async () => {
      return await this.db.users.findById(id);
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    const user = await this.db.users.update(id, data);
    
    // Invalidate cache
    await this.cache.forget(`user:${id}`);
    
    // Or update cache directly
    await this.cache.put(`user:${id}`, user, 3600);
    
    return user;
  }
}
```

### API Response Caching

```typescript
@Injectable()
export class ApiService {
  constructor(
    @Inject(CacheService) private cache: CacheService
  ) {}

  async fetchData(endpoint: string) {
    const cacheKey = `api:${endpoint}`;
    
    return this.cache.remember(cacheKey, 300, async () => {
      const response = await fetch(endpoint);
      return response.json();
    });
  }
}
```

### Rate Limiting

```typescript
@Injectable()
export class RateLimiter {
  constructor(
    @Inject(CacheService) private cache: CacheService
  ) {}

  async checkLimit(userId: string, limit: number = 100): Promise<boolean> {
    const key = `rate:${userId}`;
    const current = await this.cache.get(key, 0);
    
    if (current >= limit) {
      return false; // Rate limit exceeded
    }
    
    await this.cache.increment(key);
    
    // Set expiration on first request
    if (current === 0) {
      await this.cache.put(key, 1, 3600); // 1 hour window
    }
    
    return true;
  }
}
```

### Session Storage

```typescript
@Injectable()
export class SessionService {
  constructor(
    @Inject(CacheService) private cache: CacheService
  ) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = generateId();
    const key = `session:${sessionId}`;
    
    await this.cache.put(key, { userId, ...data }, 86400); // 24 hours
    
    return sessionId;
  }

  async getSession(sessionId: string) {
    return this.cache.get(`session:${sessionId}`);
  }

  async destroySession(sessionId: string) {
    await this.cache.forget(`session:${sessionId}`);
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

- [Documentation](https://refine.dev/docs)
- [GitHub Issues](https://github.com/refinedev/refine/issues)
- [Discord Community](https://discord.gg/refine)
