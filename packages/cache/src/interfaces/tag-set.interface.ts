/**
 * Tag set interface
 * 
 * Manages tag namespaces for cache invalidation.
 * Each tag has a unique namespace ID that changes when the tag is flushed.
 * 
 * @module types/tag-set
 * 
 * @example
 * ```typescript
 * const tagSet = new TagSet(['users', 'premium']);
 * const namespace = await tagSet.getNamespace(); // "abc123|def456"
 * await tagSet.reset(); // Invalidate all tagged items
 * ```
 */

export interface TagSet {
  /**
   * Get the tag names
   * 
   * @returns Array of tag names
   */
  getNames(): string[];

  /**
   * Get the unique namespace for these tags
   * 
   * The namespace is a combination of namespace IDs for each tag.
   * When a tag is reset, its namespace ID changes, invalidating all cache keys.
   * 
   * @returns The namespace string (e.g., "abc123|def456")
   */
  getNamespace(): Promise<string>;

  /**
   * Reset all tags (flush)
   * 
   * Regenerates namespace IDs for all tags, making old cache keys inaccessible.
   */
  reset(): Promise<void>;

  /**
   * Reset a specific tag by name
   * 
   * @param name - The tag name to reset
   */
  resetTag(name: string): Promise<void>;

  /**
   * Add a cache entry to tag tracking (optional, for Redis)
   * 
   * @param key - The cache key
   * @param seconds - TTL in seconds
   * @returns True if successful
   */
  addEntry?(key: string, seconds: number): Promise<boolean>;
}
