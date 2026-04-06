/**
 * Cache Service (Repository)
 *
 * The high-level API that consumers interact with. Wraps a Store
 * and provides convenience methods: get, put, remember, tags, etc.
 *
 * This is NOT injectable — it's created by CacheManager.store().
 * Each store gets its own CacheService instance.
 *
 * @module services/cache
 */

import type { Store, TaggableStore, TaggedCache } from '@/interfaces';

/**
 * CacheService — the consumer-facing cache API.
 *
 * Created by `CacheManager.store(name)`. Wraps a low-level Store
 * with a rich API including remember(), tags(), pull(), etc.
 *
 * @example
 * ```typescript
 * const cache = manager.store('redis');
 *
 * await cache.put('key', 'value', 3600);
 * const value = await cache.get('key');
 * const user = await cache.remember('user:1', 3600, () => fetchUser(1));
 * await cache.tags(['users']).flush();
 * ```
 */
export class CacheService {
  constructor(
    private readonly _store: Store,
    private _defaultTtl: number = 300,
  ) {}

  // ── Read ────────────────────────────────────────────────────────────────

  async has(key: string): Promise<boolean> {
    const value = await this._store.get(key);
    return value !== undefined && value !== null;
  }

  async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this._store.get(key);
    return value !== undefined ? value : defaultValue;
  }

  async many<T = any>(keys: string[]): Promise<Record<string, T>> {
    return this._store.many(keys);
  }

  // ── Write ───────────────────────────────────────────────────────────────

  async put<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this._store.put(key, value, ttl ?? this._defaultTtl);
  }

  async putMany<T = any>(values: Record<string, T>, ttl?: number): Promise<boolean> {
    return this._store.putMany(values, ttl ?? this._defaultTtl);
  }

  async add<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (await this.has(key)) return false;
    return this.put(key, value, ttl);
  }

  async forever<T = any>(key: string, value: T): Promise<boolean> {
    return this._store.forever(key, value);
  }

  // ── Counters ────────────────────────────────────────────────────────────

  async increment(key: string, value: number = 1): Promise<number> {
    const result = await this._store.increment(key, value);
    return typeof result === 'number' ? result : 0;
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    const result = await this._store.decrement(key, value);
    return typeof result === 'number' ? result : 0;
  }

  // ── Remember ────────────────────────────────────────────────────────────

  async remember<T = any>(key: string, ttl: number, cb: () => Promise<T> | T): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await cb();
    await this.put(key, value, ttl);
    return value;
  }

  async rememberForever<T = any>(key: string, cb: () => Promise<T> | T): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await cb();
    await this.forever(key, value);
    return value;
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  async pull<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.get<T>(key, defaultValue);
    await this.forget(key);
    return value;
  }

  async forget(key: string): Promise<boolean> {
    return this._store.forget(key);
  }

  async flush(): Promise<boolean> {
    return this._store.flush();
  }

  // ── Tags ────────────────────────────────────────────────────────────────

  async tags(names: string[]): Promise<TaggedCache> {
    const s = this._store;
    if (!('tags' in s && typeof (s as any).tags === 'function')) {
      throw new Error(`Store [${s.constructor.name}] does not support tagging.`);
    }
    return (s as TaggableStore).tags(names);
  }

  // ── Accessors ───────────────────────────────────────────────────────────

  getPrefix(): string {
    return this._store.getPrefix();
  }

  getStore(): Store {
    return this._store;
  }

  getDefaultTtl(): number {
    return this._defaultTtl;
  }

  setTtl(seconds: number): this {
    this._defaultTtl = seconds;
    return this;
  }
}
