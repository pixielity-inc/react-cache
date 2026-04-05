/**
 * Base Redis connection class
 *
 * @remarks
 * Provides common functionality for Redis connections.
 * Concrete implementations extend this class and provide
 * the actual Redis client integration.
 *
 * @packageDocumentation
 */

import type { RedisConnection, SetOptions, RedisPipeline } from "@/interfaces";

/**
 * Abstract base class for Redis connections
 *
 * @remarks
 * This class provides a foundation for implementing Redis connections.
 * It handles common concerns like connection naming while delegating
 * actual Redis operations to concrete implementations.
 *
 * @example
 * ```typescript
 * export class UpstashConnection extends BaseConnection {
 *   constructor(private redis: Redis, name: string) {
 *     super(name);
 *   }
 *
 *   async get(key: string): Promise<string | null> {
 *     return this.redis.get(key);
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export abstract class BaseConnection implements RedisConnection {
  /**
   * Create a new base connection
   *
   * @param name - The unique identifier for this connection
   */
  constructor(protected readonly name: string) {}

  /**
   * Get the connection name
   *
   * @returns The unique identifier for this connection
   */
  getName(): string {
    return this.name;
  }

  // Abstract methods that must be implemented by concrete classes

  /**
   * Get the underlying Redis client instance
   *
   * @returns The native Redis client object
   */
  abstract client(): unknown;

  /**
   * Get the value of a key
   *
   * @param key - The key to retrieve
   * @returns The value stored at the key, or null if the key does not exist
   */
  abstract get(key: string): Promise<string | null>;

  /**
   * Set the value of a key
   *
   * @param key - The key to set
   * @param value - The value to store
   * @param options - Optional parameters (e.g., expiration, conditions)
   * @returns 'OK' if successful, null otherwise
   */
  abstract set(
    key: string,
    value: string,
    options?: SetOptions,
  ): Promise<"OK" | null>;

  /**
   * Delete one or more keys
   *
   * @param keys - The keys to delete
   * @returns The number of keys that were removed
   */
  abstract del(...keys: string[]): Promise<number>;

  /**
   * Check if one or more keys exist
   *
   * @param keys - The keys to check
   * @returns The number of keys that exist
   */
  abstract exists(...keys: string[]): Promise<number>;

  /**
   * Set a timeout on a key
   *
   * @param key - The key to set expiration on
   * @param seconds - The number of seconds until expiration
   * @returns 1 if the timeout was set, 0 if the key does not exist
   */
  abstract expire(key: string, seconds: number): Promise<number>;

  /**
   * Get the time to live for a key
   *
   * @param key - The key to check
   * @returns The remaining time to live in seconds, -1 if no expiration, -2 if key does not exist
   */
  abstract ttl(key: string): Promise<number>;

  /**
   * Get the values of multiple keys
   *
   * @param keys - The keys to retrieve
   * @returns An array of values, with null for keys that do not exist
   */
  abstract mget(...keys: string[]): Promise<(string | null)[]>;

  /**
   * Set multiple keys to multiple values
   *
   * @param data - An object mapping keys to values
   * @returns 'OK' if successful
   */
  abstract mset(data: Record<string, string>): Promise<"OK">;

  /**
   * Increment the integer value of a key by one
   *
   * @param key - The key to increment
   * @returns The value after incrementing
   */
  abstract incr(key: string): Promise<number>;

  /**
   * Increment the integer value of a key by a given amount
   *
   * @param key - The key to increment
   * @param increment - The amount to increment by
   * @returns The value after incrementing
   */
  abstract incrby(key: string, increment: number): Promise<number>;

  /**
   * Decrement the integer value of a key by one
   *
   * @param key - The key to decrement
   * @returns The value after decrementing
   */
  abstract decr(key: string): Promise<number>;

  /**
   * Decrement the integer value of a key by a given amount
   *
   * @param key - The key to decrement
   * @param decrement - The amount to decrement by
   * @returns The value after decrementing
   */
  abstract decrby(key: string, decrement: number): Promise<number>;

  /**
   * Add a member with a score to a sorted set
   *
   * @param key - The sorted set key
   * @param score - The score for the member
   * @param member - The member to add
   * @returns The number of elements added (0 if member already existed and score was updated)
   */
  abstract zadd(key: string, score: number, member: string): Promise<number>;

  /**
   * Get a range of members from a sorted set by index
   *
   * @param key - The sorted set key
   * @param start - The starting index (0-based)
   * @param stop - The ending index (inclusive, -1 for last element)
   * @returns An array of members in the specified range
   */
  abstract zrange(key: string, start: number, stop: number): Promise<string[]>;

  /**
   * Remove one or more members from a sorted set
   *
   * @param key - The sorted set key
   * @param members - The members to remove
   * @returns The number of members removed
   */
  abstract zrem(key: string, ...members: string[]): Promise<number>;

  /**
   * Remove members from a sorted set with scores within a given range
   *
   * @param key - The sorted set key
   * @param min - The minimum score (inclusive)
   * @param max - The maximum score (inclusive)
   * @returns The number of members removed
   */
  abstract zremrangebyscore(
    key: string,
    min: number,
    max: number,
  ): Promise<number>;

  /**
   * Execute a Lua script on the Redis server
   *
   * @param script - The Lua script to execute
   * @param keys - The keys that the script will access
   * @param args - Additional arguments to pass to the script
   * @returns The result of the script execution
   */
  abstract eval(
    script: string,
    keys: string[],
    args: (string | number)[],
  ): Promise<unknown>;

  /**
   * Create a pipeline for batching multiple commands
   *
   * @returns A pipeline object for chaining commands
   */
  abstract pipeline(): RedisPipeline;

  /**
   * Delete all keys in the current database
   *
   * @returns 'OK' if successful
   */
  abstract flushdb(): Promise<"OK">;

  /**
   * Close the connection to the Redis server
   *
   * @returns A promise that resolves when the connection is closed
   */
  abstract disconnect(): Promise<void>;
}
