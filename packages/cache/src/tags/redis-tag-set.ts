/**
 * Redis Tag Set Implementation
 * 
 * Manages tag namespaces and TTL tracking using Redis.
 * This is a more sophisticated implementation than the base TagSet,
 * with persistent namespaces and automatic cleanup of expired entries.
 * 
 * **Redis Data Structures:**
 * - `tag:{tagName}:namespace` → String (namespace ID)
 * - `tag:{tagName}:entries` → Sorted Set (cache keys with expiration scores)
 * 
 * **How TTL Tracking Works:**
 * 1. When a tagged item is cached, its key is added to a sorted set
 * 2. The score is the expiration timestamp (current time + TTL)
 * 3. Expired entries can be efficiently removed using ZREMRANGEBYSCORE
 * 4. This prevents memory leaks from orphaned tag references
 * 
 * @module tags/redis-tag-set
 */

import type { TagSet as ITagSet } from '@/interfaces';

/**
 * Redis connection interface (minimal subset needed)
 * 
 * This avoids a hard dependency on @abdokouta/redis in the type system.
 */
interface RedisConnection {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK' | null>;
  del(...keys: string[]): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
}

/**
 * Redis tag set implementation
 * 
 * Provides persistent tag namespace management with TTL tracking.
 * 
 * **Advantages over base TagSet:**
 * - Namespaces persist across application restarts
 * - Tracks expiration times for cleanup
 * - Supports distributed caching (multiple servers)
 * 
 * @example
 * ```typescript
 * const redis = await redisManager.connection('cache');
 * const tagSet = new RedisTagSet(redis, ['users', 'premium']);
 * 
 * // Get namespace (persisted in Redis)
 * const namespace = await tagSet.getNamespace();
 * 
 * // Track cache entry with TTL
 * await tagSet.addEntry('user:123', 3600);
 * 
 * // Remove expired entries
 * await tagSet.removeExpiredEntries();
 * 
 * // Flush tags
 * await tagSet.reset();
 * ```
 */
export class RedisTagSet implements ITagSet {
  /** 
 * Tag names 
 */
  private readonly names: string[];
  
  /** 
 * Redis connection 
 */
  private readonly redis: RedisConnection;

  /**
   * Create a new Redis tag set
   * 
   * @param redis - Redis connection
   * @param names - Array of tag names
   */
  constructor(redis: RedisConnection, names: string[]) {
    this.redis = redis;
    this.names = names;
  }

  /**
   * Get the unique namespace for these tags
   * 
   * Retrieves namespace IDs from Redis, creating them if they don't exist.
   * 
   * @returns The namespace string (e.g., "abc123|def456")
   * 
   * @example
   * ```typescript
   * const namespace = await tagSet.getNamespace();
   * // "7f3e9a2b|4c8d1f6e" (persisted in Redis)
   * ```
   */
  async getNamespace(): Promise<string> {
    const namespaces = await Promise.all(
      this.names.map(name => this.getNamespaceForTag(name))
    );
    
    return namespaces.join('|');
  }

  /**
   * Get the tag names
   * 
   * @returns Array of tag names
   */
  getNames(): string[] {
    return this.names;
  }

  /**
   * Reset all tags (flush)
   * 
   * Regenerates namespace IDs in Redis for all tags,
   * making old cache keys inaccessible.
   * 
   * Also clears the sorted sets tracking tag entries.
   * 
   * @example
   * ```typescript
   * await tagSet.reset(); // All tagged cache items become inaccessible
   * ```
   */
  async reset(): Promise<void> {
    // Regenerate namespace IDs
    await Promise.all(
      this.names.map(async (name) => {
        const namespaceKey = this.getNamespaceKey(name);
        const newNamespace = this.generateNamespaceId();
        await this.redis.set(namespaceKey, newNamespace);
      })
    );

    // Clear tag entry tracking
    const entryKeys = this.names.map(name => this.getEntriesKey(name));
    if (entryKeys.length > 0) {
      await this.redis.del(...entryKeys);
    }
  }

  /**
   * Reset a specific tag by name
   * 
   * Regenerates the namespace ID in Redis for the specified tag.
   * 
   * @param name - The tag name to reset
   * 
   * @example
   * ```typescript
   * await tagSet.resetTag('users'); // Only 'users' tag is invalidated
   * ```
   */
  async resetTag(name: string): Promise<void> {
    const namespaceKey = this.getNamespaceKey(name);
    const newNamespace = this.generateNamespaceId();
    await this.redis.set(namespaceKey, newNamespace);

    // Clear tag entry tracking for this tag
    const entriesKey = this.getEntriesKey(name);
    await this.redis.del(entriesKey);
  }

  /**
   * Add a cache entry to tag tracking
   * 
   * Stores the cache key in sorted sets for all tags,
   * with expiration timestamp as the score.
   * 
   * This allows efficient cleanup of expired entries later.
   * 
   * @param key - The cache key (without namespace prefix)
   * @param seconds - TTL in seconds
   * @returns Always true
   * 
   * @example
   * ```typescript
   * // Track that 'user:123' expires in 1 hour
   * await tagSet.addEntry('user:123', 3600);
   * 
   * // Later, remove expired entries
   * await tagSet.removeExpiredEntries();
   * ```
   */
  async addEntry(key: string, seconds: number): Promise<boolean> {
    // Calculate expiration timestamp
    const expiresAt = Math.floor(Date.now() / 1000) + seconds;

    // Add to sorted set for each tag
    await Promise.all(
      this.names.map(async (name) => {
        const entriesKey = this.getEntriesKey(name);
        await this.redis.zadd(entriesKey, expiresAt, key);
      })
    );
    
    return true;
  }

  /**
   * Remove expired entries from tag tracking
   * 
   * Removes entries from sorted sets where score < current timestamp.
   * This prevents memory leaks from accumulating expired tag references.
   * 
   * **When to call:**
   * - Periodically via a cron job
   * - Before reading tag entries
   * - During cache maintenance
   * 
   * @returns Total number of entries removed across all tags
   * 
   * @example
   * ```typescript
   * // Remove expired entries
   * const removed = await tagSet.removeExpiredEntries();
   * console.log(`Cleaned up ${removed} expired tag references`);
   * ```
   */
  async removeExpiredEntries(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    let totalRemoved = 0;

    // Remove expired entries from each tag's sorted set
    await Promise.all(
      this.names.map(async (name) => {
        const entriesKey = this.getEntriesKey(name);
        // Remove entries with score < now (expired)
        const removed = await this.redis.zremrangebyscore(entriesKey, 0, now);
        totalRemoved += removed;
      })
    );
    
    return totalRemoved;
  }

  /**
   * Get or create namespace ID for a single tag
   * 
   * Retrieves the namespace from Redis, or generates a new one if it doesn't exist.
   * 
   * @param tag - Tag name
   * @returns The namespace ID for this tag
   * @private
   */
  private async getNamespaceForTag(tag: string): Promise<string> {
    const namespaceKey = this.getNamespaceKey(tag);
    let namespace = await this.redis.get(namespaceKey);
    
    if (!namespace) {
      namespace = this.generateNamespaceId();
      await this.redis.set(namespaceKey, namespace);
    }
    
    return namespace;
  }

  /**
   * Get the Redis key for a tag's namespace
   * 
   * @param tag - Tag name
   * @returns Redis key (e.g., "tag:users:namespace")
   * @private
   */
  private getNamespaceKey(tag: string): string {
    return `tag:${tag}:namespace`;
  }

  /**
   * Get the Redis key for a tag's entries sorted set
   * 
   * @param tag - Tag name
   * @returns Redis key (e.g., "tag:users:entries")
   * @private
   */
  private getEntriesKey(tag: string): string {
    return `tag:${tag}:entries`;
  }

  /**
   * Generate a unique namespace ID
   * 
   * Uses timestamp + random string for uniqueness.
   * 
   * @returns A unique namespace ID
   * @private
   */
  private generateNamespaceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}${random}`;
  }
}
