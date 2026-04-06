import { Card, Chip, Separator } from '@heroui/react';
import { CacheManager, CACHE_MANAGER } from '@abdokouta/react-cache';
import { useInject } from '@abdokouta/ts-container';

import { title } from '@/components/primitives';
import DefaultLayout from '@/layouts/default';

export default function ConfigPage() {
  const manager = useInject<CacheManager>(CACHE_MANAGER);

  const defaultStore = manager.getDefaultDriver();
  const storeNames = manager.getStoreNames();
  const prefix = manager.getGlobalPrefix();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Configuration</span>
          <p className="text-default-500 mt-4">
            How to set up @abdokouta/react-cache in your project
          </p>
        </div>

        <div className="w-full max-w-4xl space-y-8">
          {/* Current Config */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Active Configuration</h2>
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold w-36">Default Store:</span>
                  <Chip color="accent" size="sm" variant="soft">
                    <Chip.Label>{defaultStore}</Chip.Label>
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold w-36">Prefix:</span>
                  <Chip size="sm" variant="soft">
                    <Chip.Label>{prefix || '(none)'}</Chip.Label>
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold w-36">Stores:</span>
                  <div className="flex gap-1">
                    {storeNames.map((name) => (
                      <Chip
                        key={name}
                        color={name === defaultStore ? 'success' : 'default'}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>{name}</Chip.Label>
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* defineConfig */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">1. Define Config</h2>
            <p className="text-default-500 text-sm">
              Create a type-safe configuration file using defineConfig()
            </p>
            <Card className="p-6">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre">
                {`// config/cache.config.ts
import { defineConfig } from "@abdokouta/react-cache";

export default defineConfig({
  default: "memory",
  stores: {
    memory: {
      driver: "memory",
      maxSize: 100,
      ttl: 300,
      prefix: "example_",
    },
    null: {
      driver: "null",
    },
  },
  prefix: "app_",
});`}
              </pre>
            </Card>
          </div>

          <Separator />

          {/* Module Setup */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">2. Register Module</h2>
            <p className="text-default-500 text-sm">
              Import CacheModule.forRoot() in your root module
            </p>
            <Card className="p-6">
              <pre className="text-sm font-mono overflow-x-auto whitespace-pre">
                {`// modules/app.module.ts
import { Module } from "@abdokouta/ts-container";
import { CacheModule } from "@abdokouta/react-cache";
import cacheConfig from "@/config/cache.config";

@Module({
  imports: [
    CacheModule.forRoot(cacheConfig),
  ],
})
export class AppModule {}`}
              </pre>
            </Card>
          </div>

          <Separator />

          {/* Usage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">3. Use in Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Via DI</h3>
                <pre className="text-sm font-mono overflow-x-auto whitespace-pre">
                  {`import { CacheService } from "@abdokouta/react-cache";
import { useInject } from "@abdokouta/ts-container";

const cache = useInject<CacheService>(CacheService);

await cache.put("key", value, 3600);
const val = await cache.get("key");`}
                </pre>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">Via Hook</h3>
                <pre className="text-sm font-mono overflow-x-auto whitespace-pre">
                  {`import { useCache } from "@abdokouta/react-cache";

const cache = useCache();

const user = await cache.remember(
  "user:123", 3600, () => fetchUser(123)
);`}
                </pre>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Drivers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Available Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Memory</h4>
                <p className="text-xs text-default-500">
                  In-memory Map with TTL and LRU eviction. Fast, no dependencies. Data lost on
                  refresh.
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Redis</h4>
                <p className="text-xs text-default-500">
                  Persistent, distributed. Supports tagging. Requires @abdokouta/react-redis.
                </p>
              </Card>
              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Null</h4>
                <p className="text-xs text-default-500">
                  No-op store. All writes succeed, all reads return undefined. For testing.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
