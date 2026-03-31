/**
 * Tag Set Base Implementation
 *
 * Manages tag namespaces for cache tagging.
 * This is a simple in-memory implementation used by non-Redis stores.
 *
 * **How Tag Namespaces Work:**
 * 1. Each tag has a unique namespace ID (UUID)
 * 2. Cache keys are prefixed with combined namespace IDs
 * 3. When a tag is flushed, its namespace ID is regenerated
 * 4. Old cache keys become inaccessible (orphaned)
 *
 * @module tags/tag-set
 */

import type { TagSet as ITagSet } from '@/interfaces';

/**
 * Base tag set implementation
 *
 * Provides in-memory tag namespace management.
 * This implementation doesn't persist namespaces, so they're regenerated
 * on each application restart.
 *
 * @example
 * ```typescript
 * const tagSet = new TagSet(['users', 'premium']);
 *
 * // Get namespace (e.g., "abc123|def456")
 * const namespace = await tagSet.getNamespace();
 *
 * // Build cache key
 * const cacheKey = namespace + ':user:123';
 *
 * // Flush tags (regenerate namespaces)
 * await tagSet.reset();
 * ```
 */
export class TagSet implements ITagSet {
  /**
   * Tag names
   */
  private readonly names: string[];

  /**
   * In-memory namespace storage
   */
  private static namespaces: Map<string, string> = new Map();

  /**
   * Create a new tag set
   *
   * @param names - Array of tag names
   */
  constructor(names: string[]) {
    this.names = names;
  }

  /**
   * Get the unique namespace for these tags
   *
   * Combines all tag namespace IDs into a single prefix.
   * If a tag doesn't have a namespace yet, one is generated.
   *
   * @returns The namespace string (e.g., "abc123|def456")
   *
   * @example
   * ```typescript
   * const namespace = await tagSet.getNamespace();
   * // "7f3e9a2b|4c8d1f6e"
   * ```
   */
  async getNamespace(): Promise<string> {
    const namespaces = await Promise.all(this.names.map((name) => this.getNamespaceForTag(name)));

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
   * Regenerates namespace IDs for all tags,
   * making old cache keys inaccessible.
   *
   * @example
   * ```typescript
   * await tagSet.reset(); // All tagged cache items become inaccessible
   * ```
   */
  async reset(): Promise<void> {
    for (const name of this.names) {
      TagSet.namespaces.set(name, this.generateNamespaceId());
    }
  }

  /**
   * Reset a specific tag by name
   *
   * Generates a new namespace ID for the specified tag.
   *
   * @param name - The tag name to reset
   *
   * @example
   * ```typescript
   * await tagSet.resetTag('users'); // Only 'users' tag is invalidated
   * ```
   */
  async resetTag(name: string): Promise<void> {
    TagSet.namespaces.set(name, this.generateNamespaceId());
  }

  /**
   * Get or create namespace ID for a single tag
   *
   * @param tag - Tag name
   * @returns The namespace ID for this tag
   * @private
   */
  private async getNamespaceForTag(tag: string): Promise<string> {
    let namespace = TagSet.namespaces.get(tag);

    if (!namespace) {
      namespace = this.generateNamespaceId();
      TagSet.namespaces.set(tag, namespace);
    }

    return namespace;
  }

  /**
   * Generate a unique namespace ID
   *
   * Uses a simple random string generator.
   * In production, you might want to use a more robust UUID generator.
   *
   * @returns A unique namespace ID
   * @private
   */
  private generateNamespaceId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * Clear all namespaces (for testing)
   *
   * @internal
   */
  static clearNamespaces(): void {
    TagSet.namespaces.clear();
  }
}
