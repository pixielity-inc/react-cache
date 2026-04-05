/**
 * Dependency injection tokens for Redis module
 *
 * @remarks
 * These symbols are used as unique identifiers for dependency injection.
 * Using symbols prevents naming collisions and provides type-safe DI tokens.
 *
 * @packageDocumentation
 */

/**
 * Injection token for Redis configuration
 *
 * @remarks
 * Use this token to inject the Redis configuration object into services.
 * The configuration defines connection settings for all Redis instances.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Inject(REDIS_CONFIG) private config: RedisConfig
 *   ) {}
 * }
 * ```
 */
export const REDIS_CONFIG = Symbol.for("REDIS_CONFIG");

/**
 * Injection token for Redis connector
 *
 * @remarks
 * Use this token to inject the Redis connector that creates connections.
 * The connector is responsible for initializing Redis clients from configuration.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Inject(REDIS_CONNECTOR) private connector: RedisConnector
 *   ) {}
 * }
 * ```
 */
export const REDIS_CONNECTOR = Symbol.for("REDIS_CONNECTOR");
