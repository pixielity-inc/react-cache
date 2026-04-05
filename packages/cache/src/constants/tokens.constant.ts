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
export const CACHE_CONFIG = Symbol.for('CACHE_CONFIG');

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
export const CACHE_SERVICE = Symbol.for('CACHE_SERVICE');

/**
 * Redis factory token (optional)
 *
 * Register a RedisFactory implementation under this token to enable
 * Redis-backed cache stores. Only needed when using `driver: 'redis'`.
 *
 * @example
 * ```typescript
 * import { REDIS_FACTORY } from '@abdokouta/react-cache';
 *
 * // In your module providers:
 * { provide: REDIS_FACTORY, useClass: MyRedisFactory }
 * ```
 */
export const REDIS_FACTORY = Symbol.for('REDIS_FACTORY');

/**
 * Cache manager token
 *
 * Used to inject the CacheManager (store resolution, driver creation).
 * Most users should use CACHE_SERVICE instead — the manager is for
 * advanced use cases like switching stores at runtime.
 *
 * @example
 * ```typescript
 * import { CACHE_MANAGER } from '@abdokouta/react-cache';
 *
 * const manager = useInject<CacheManager>(CACHE_MANAGER);
 * const redisCache = manager.store('redis');
 * ```
 */
export const CACHE_MANAGER = Symbol.for('CACHE_MANAGER');
