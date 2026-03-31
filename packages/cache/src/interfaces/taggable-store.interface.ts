/**
 * Taggable cache store interface
 * 
 * Extends the base Store interface with tagging support.
 * Only stores that support tagging (e.g., Redis) should implement this.
 * 
 * @module interfaces/taggable-store
 * 
 * @example
 * ```typescript
 * class RedisStore implements TaggableStore {
 *   // ... Store methods
 *   
 *   tags(names: string[]): TaggedCache {
 *     const tagSet = new RedisTagSet(this.redis, names);
 *     return new TaggedCache(this, tagSet);
 *   }
 * }
 * ```
 */

import type { Store } from './store.interface';
import type { TaggedCache } from './tagged-cache.interface';

export interface TaggableStore extends Store {
  /**
   * Begin executing a new tags operation
   * 
   * @param names - Array of tag names
   * @returns A TaggedCache instance
   */
  tags(names: string[]): TaggedCache;
}
