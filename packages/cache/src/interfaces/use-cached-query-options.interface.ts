/**
 * Options for useCachedQuery hook
 *
 * @module interfaces/use-cached-query-options
 */

export interface UseCachedQueryOptions<T> {
  /**
   * Cache key
   */
  key: string;

  /**
   * Query function to execute on cache miss
   */
  queryFn: () => Promise<T>;

  /**
   * TTL in seconds (default: 300)
   */
  ttl?: number;

  /**
   * Store name (optional, uses default if not specified)
   */
  storeName?: string;

  /**
   * Enable/disable the query (default: true)
   */
  enabled?: boolean;

  /**
   * Refetch interval in milliseconds (optional)
   */
  refetchInterval?: number;

  /**
   * Refetch on component mount (default: false)
   */
  refetchOnMount?: boolean;
}
