import { useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { CacheService, CACHE_SERVICE } from '@abdokouta/react-cache';
import { useInject } from '@abdokouta/react-di';

import { title, subtitle } from '@/components/primitives';
import { GithubIcon } from '@/components/icons';
import DefaultLayout from '@/layouts/default';

export default function IndexPage() {
  const cache = useInject<CacheService>(CACHE_SERVICE);

  const [result, setResult] = useState<string | null>(null);
  const [counter, setCounter] = useState<number | null>(null);

  const handleRemember = async () => {
    const value = await cache.remember('demo:greeting', 30, async () => {
      return `Hello from cache at ${new Date().toLocaleTimeString()}`;
    });

    setResult(value);
  };

  const handleIncrement = async () => {
    const value = await cache.increment('demo:counter');

    setCounter(value);
  };

  const handleFlush = async () => {
    await cache.flush();
    setResult(null);
    setCounter(null);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Laravel-Inspired&nbsp;</span>
          <span className={title({ color: 'blue' })}>Caching&nbsp;</span>
          <br />
          <span className={title()}>for React</span>
          <div className={subtitle({ class: 'mt-4' })}>
            Multiple drivers, remember pattern, tagging, and React hooks
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="lg" variant="primary" onPress={() => window.location.assign('/config')}>
            Configuration
          </Button>
          <Button
            size="lg"
            variant="outline"
            onPress={() => window.open('https://github.com/abdokouta/cache', '_blank')}
          >
            <GithubIcon size={20} />
            GitHub
          </Button>
        </div>

        <div className="mt-8 w-full max-w-2xl">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Try it out</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" onPress={handleRemember}>
                remember()
              </Button>
              <Button size="sm" variant="secondary" onPress={handleIncrement}>
                increment()
              </Button>
              <Button size="sm" variant="danger" onPress={handleFlush}>
                flush()
              </Button>
            </div>

            {result && (
              <div className="p-3 bg-default-100 rounded text-sm mb-2">
                <span className="font-semibold">remember: </span>
                {result}
                <p className="text-xs text-default-400 mt-1 italic">
                  Click again — same value until TTL expires
                </p>
              </div>
            )}

            {counter !== null && (
              <div className="p-3 bg-default-100 rounded text-sm">
                <span className="font-semibold">counter: </span>
                <Chip color="accent" size="sm" variant="soft">
                  <Chip.Label>{counter}</Chip.Label>
                </Chip>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 rounded-xl bg-surface shadow-surface px-4 py-2">
            <pre className="text-sm font-medium font-mono">
              pnpm add{' '}
              <code className="px-2 py-1 h-fit font-mono font-normal inline whitespace-nowrap rounded-sm bg-accent/20 text-accent text-sm">
                @abdokouta/react-cache @abdokouta/react-di
              </code>
            </pre>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
