/**
 * Result of useCachedQuery hook
 * 
 * @module types/use-cached-query-result
 */

export interface UseCachedQueryResult<T> {
  /** 
 * Query data 
 */
  data: T | undefined;

  /** 
 * Loading state 
 */
  isLoading: boolean;

  /** 
 * Error state 
 */
  error: Error | null;

  /** 
 * Refetch function 
 */
  refetch: () => Promise<void>;

  /** 
 * Invalidate cache and refetch 
 */
  invalidate: () => Promise<void>;
}
