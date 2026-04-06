/**
 * Redis Cache Store
 *
 * Redis-backed cache using @abdokouta/react-redis for connections.
 * Connection is resolved lazily from RedisService and cached.
 *
 * @module stores/redis
 */

import type { RedisConnection, IRedisService } from '@abdokouta/react-redis';
import type { TaggableStore, TaggedCache } from '@/interfaces';
import { RedisTagSet } from '@/tags/redis-tag-set';
import { TaggedCache as TaggedCacheImpl } from '@/tags/tagged-cache';

export class RedisStore implements TaggableStore {
  private readonly redisService: IRedisService;
  private readonly prefix: string;
  private readonly connectionName: string;
  private _connection?: RedisConnection;

  constructor(
    redisService: IRedisService,
    prefix: string = '',
    connection: string = 'default',
  ) {
    this.redisService = redisService;
    this.prefix = prefix;
    this.connectionName = connection;
  }

  /** 
 * Resolve connection lazily and cache it. 
 */
  private async conn(): Promise<RedisConnection> {
    if (!this._connection) {
      this._connection = await this.redisService.connection(this.connectionName);
    }
    return this._connection!;
  }

  async get(key: string): Promise<any> {
    const c = await this.conn();
    const value = await c.get(this.prefix + key);
    return value === null ? undefined : this.deserialize(value);
  }

  async many(keys: string[]): Promise<Record<string, any>> {
    if (keys.length === 0) return {};
    const c = await this.conn();
    const prefixed = keys.map((k) => this.prefix + k);
    const values = await c.mget(...prefixed);
    const results: Record<string, any> = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k !== undefined) {
        results[k] = values[i] !== null ? this.deserialize(values[i]!) : undefined;
      }
    }
    return results;
  }

  async put(key: string, value: any, seconds: number): Promise<boolean> {
    const c = await this.conn();
    const result = await c.set(this.prefix + key, this.serialize(value), { ex: seconds });
    return result === 'OK';
  }

  async putMany(values: Record<string, any>, seconds: number): Promise<boolean> {
    if (Object.keys(values).length === 0) return true;
    const c = await this.conn();
    const serialized: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      serialized[this.prefix + k] = this.serialize(v);
    }
    await c.mset(serialized);
    await Promise.all(
      Object.keys(values).map((k) => {
        const sv = serialized[this.prefix + k];
        return sv !== undefined ? c.set(this.prefix + k, sv, { ex: seconds }) : Promise.resolve();
      }),
    );
    return true;
  }

  async increment(key: string, value: number = 1): Promise<number | boolean> {
    const c = await this.conn();
    return value === 1 ? c.incr(this.prefix + key) : c.incrby(this.prefix + key, value);
  }

  async decrement(key: string, value: number = 1): Promise<number | boolean> {
    const c = await this.conn();
    return value === 1 ? c.decr(this.prefix + key) : c.decrby(this.prefix + key, value);
  }

  async forever(key: string, value: any): Promise<boolean> {
    const c = await this.conn();
    const result = await c.set(this.prefix + key, this.serialize(value), { ex: 315360000 });
    return result === 'OK';
  }

  async forget(key: string): Promise<boolean> {
    const c = await this.conn();
    return (await c.del(this.prefix + key)) > 0;
  }

  async flush(): Promise<boolean> {
    const c = await this.conn();
    return (await c.flushdb()) === 'OK';
  }

  getPrefix(): string {
    return this.prefix;
  }

  async tags(names: string[]): Promise<TaggedCache> {
    const c = await this.conn();
    const tagSet = new RedisTagSet(c, names);
    return new TaggedCacheImpl(this, tagSet);
  }

  private serialize(value: any): string {
    return JSON.stringify(value);
  }

  private deserialize(value: string): any {
    try { return JSON.parse(value); }
    catch { return value; }
  }
}
