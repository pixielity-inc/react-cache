import { useState } from 'react';
import { Button, Card, Chip, Separator } from '@heroui/react';
import { CacheService, CacheManager, CACHE_SERVICE, CACHE_MANAGER } from '@abdokouta/react-cache';
import { useInject } from '@abdokouta/react-di';

import { title } from '@/components/primitives';
import DefaultLayout from '@/layouts/default';

export default function AdvancedPage() {
  const cache = useInject<CacheService>(CACHE_SERVICE);
  const manager = useInject<CacheManager>(CACHE_MANAGER);

  // Basic ops state
  const [lastKey, setLastKey] = useState('');
  const [getValue, setGetValue] = useState<string | undefined>();
  const [hasResult, setHasResult] = useState<boolean | null>(null);

  // Remember state
  const [rememberResult, setRememberResult] = useState<string | null>(null);
  const [rememberForeverResult, setRememberForeverResult] = useState<string | null>(null);

  // Counter state
  const [counter, setCounter] = useState<number | null>(null);

  // Pull state
  const [pullResult, setPullResult] = useState<string | null>(null);

  // Multi state
  const [manyResult, setManyResult] = useState<Record<string, unknown> | null>(null);

  // Store switching
  const storeNames = manager.getStoreNames();

  // --- Basic Operations ---
  const handlePut = async () => {
    const key = `item:${Date.now()}`;
    const value = `Created at ${new Date().toLocaleTimeString()}`;

    await cache.put(key, value, 60);
    setLastKey(key);
    setGetValue(undefined);
    setHasResult(null);
  };

  const handleGet = async () => {
    if (!lastKey) return;

    const value = await cache.get<string>(lastKey);

    setGetValue(value ?? '(not found)');
  };

  const handleHas = async () => {
    if (!lastKey) return;

    const exists = await cache.has(lastKey);

    setHasResult(exists);
  };

  const handleForget = async () => {
    if (!lastKey) return;

    await cache.forget(lastKey);
    setGetValue(undefined);
    setHasResult(null);
  };

  const handleFlush = async () => {
    await cache.flush();
    setLastKey('');
    setGetValue(undefined);
    setHasResult(null);
    setRememberResult(null);
    setRememberForeverResult(null);
    setCounter(null);
    setPullResult(null);
    setManyResult(null);
  };

  // --- Remember ---
  const handleRemember = async () => {
    const value = await cache.remember('adv:remember', 30, async () => {
      return `Computed at ${new Date().toLocaleTimeString()}`;
    });

    setRememberResult(value);
  };

  const handleRememberForever = async () => {
    const value = await cache.rememberForever('adv:forever', async () => {
      return `Stored forever at ${new Date().toLocaleTimeString()}`;
    });

    setRememberForeverResult(value);
  };

  // --- Counters ---
  const handleIncrement = async () => {
    const value = await cache.increment('adv:counter');

    setCounter(value);
  };

  const handleDecrement = async () => {
    const value = await cache.decrement('adv:counter');

    setCounter(value);
  };

  // --- Pull ---
  const handlePull = async () => {
    await cache.put('adv:pull-me', 'I will be removed after pull', 60);
    const value = await cache.pull<string>('adv:pull-me');

    setPullResult(value ?? '(empty)');
  };

  // --- Many ---
  const handlePutMany = async () => {
    await cache.putMany({ 'adv:a': 'Alpha', 'adv:b': 'Bravo', 'adv:c': 'Charlie' }, 60);
    const values = await cache.many(['adv:a', 'adv:b', 'adv:c']);

    setManyResult(values);
  };

  // --- Add ---
  const [addResult, setAddResult] = useState<boolean | null>(null);

  const handleAdd = async () => {
    const added = await cache.add('adv:unique', 'first-write-wins', 60);

    setAddResult(added);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Advanced Cache Operations</span>
          <p className="text-default-500 mt-4">Interactive demo of every CacheService method</p>
        </div>

        <div className="w-full max-w-5xl space-y-8">
          {/* Store Switching */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Store Switching</h2>
            <div className="flex gap-2">
              {storeNames.map((name) => (
                <Chip
                  key={name}
                  color={name === manager.getDefaultDriver() ? 'accent' : 'default'}
                  size="sm"
                  variant="soft"
                >
                  <Chip.Label>{name}</Chip.Label>
                </Chip>
              ))}
            </div>
            <p className="text-xs text-default-400">
              Active: {manager.getDefaultDriver()} — switch stores with
              cache.store(&quot;name&quot;)
            </p>
          </div>

          <Separator />

          {/* Basic Operations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">put / get / has / forget / flush</h2>
            <Card className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button size="sm" onPress={handlePut}>
                  put()
                </Button>
                <Button isDisabled={!lastKey} size="sm" variant="secondary" onPress={handleGet}>
                  get()
                </Button>
                <Button isDisabled={!lastKey} size="sm" variant="secondary" onPress={handleHas}>
                  has()
                </Button>
                <Button isDisabled={!lastKey} size="sm" variant="outline" onPress={handleForget}>
                  forget()
                </Button>
                <Button size="sm" variant="danger" onPress={handleFlush}>
                  flush()
                </Button>
              </div>

              {lastKey && (
                <div className="p-3 bg-default-100 rounded text-xs space-y-1">
                  <p>
                    <span className="font-semibold">key:</span> {lastKey}
                  </p>
                  {getValue !== undefined && (
                    <p>
                      <span className="font-semibold">get():</span> {getValue}
                    </p>
                  )}
                  {hasResult !== null && (
                    <p>
                      <span className="font-semibold">has():</span> {hasResult ? 'true' : 'false'}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          <Separator />

          {/* Remember Pattern */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">remember / rememberForever</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">remember(key, ttl, fn)</h3>
                <p className="text-default-500 text-xs mb-3">
                  Returns cached value or computes and stores it
                </p>
                <Button size="sm" onPress={handleRemember}>
                  Run
                </Button>
                {rememberResult && (
                  <div className="mt-3 p-2 bg-default-100 rounded text-xs">
                    {rememberResult}
                    <p className="text-default-400 mt-1 italic">Same value until 30s TTL expires</p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">rememberForever(key, fn)</h3>
                <p className="text-default-500 text-xs mb-3">Same as remember but never expires</p>
                <Button size="sm" onPress={handleRememberForever}>
                  Run
                </Button>
                {rememberForeverResult && (
                  <div className="mt-3 p-2 bg-default-100 rounded text-xs">
                    {rememberForeverResult}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Separator />

          {/* Increment / Decrement */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">increment / decrement</h2>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Button size="sm" onPress={handleDecrement}>
                  decrement()
                </Button>
                <Chip color="accent" size="lg" variant="soft">
                  <Chip.Label>{counter ?? 0}</Chip.Label>
                </Chip>
                <Button size="sm" onPress={handleIncrement}>
                  increment()
                </Button>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Pull, Add, Many */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">pull / add / many</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">pull(key)</h3>
                <p className="text-default-500 text-xs mb-3">Get and remove in one call</p>
                <Button size="sm" onPress={handlePull}>
                  Run
                </Button>
                {pullResult && (
                  <div className="mt-3 p-2 bg-default-100 rounded text-xs">
                    {pullResult}
                    <p className="text-default-400 mt-1 italic">Key is now deleted</p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">add(key, val, ttl)</h3>
                <p className="text-default-500 text-xs mb-3">
                  Store only if key doesn&apos;t exist
                </p>
                <Button size="sm" onPress={handleAdd}>
                  Run
                </Button>
                {addResult !== null && (
                  <div className="mt-3 p-2 bg-default-100 rounded text-xs">
                    <Chip color={addResult ? 'success' : 'warning'} size="sm" variant="soft">
                      <Chip.Label>{addResult ? 'Added (new)' : 'Skipped (exists)'}</Chip.Label>
                    </Chip>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-3">putMany / many</h3>
                <p className="text-default-500 text-xs mb-3">Bulk store and retrieve</p>
                <Button size="sm" onPress={handlePutMany}>
                  Run
                </Button>
                {manyResult && (
                  <div className="mt-3 p-2 bg-default-100 rounded text-xs space-y-1">
                    {Object.entries(manyResult).map(([k, v]) => (
                      <p key={k}>
                        <span className="font-semibold">{k}:</span> {String(v)}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
