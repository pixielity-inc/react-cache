/**
 * Dependency Injection Tokens
 *
 * Defines symbols used for dependency injection in the cache system.
 * These tokens are used to register and resolve dependencies in the IoC container.
 *
 * @module constants/tokens
 */

/**
 * Cache configuration token
 *
 * Used to inject the cache configuration object into services.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class CacheManager {
 *   constructor(
 *     @Inject(CACHE_CONFIG) private config: CacheModuleOptions
 *   ) {}
 * }
 * ```
 */
export const CACHE_CONFIG = Symbol('CACHE_CONFIG');

/**
 * Cache service token
 *
 * Used to inject the high-level cache service (public API).
 *
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject(CACHE_SERVICE) private cache: CacheService
 *   ) {}
 * }
 * ```
 */
export const CACHE_SERVICE = Symbol('CACHE_SERVICE');
