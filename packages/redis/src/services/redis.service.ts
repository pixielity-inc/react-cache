/**
 * Redis service for managing connections and providing Redis operations
 *
 * @remarks
 * This service is the main entry point for Redis operations in the application.
 * It manages multiple named connections internally and provides a simple API
 * for accessing Redis functionality.
 *
 * Unlike a separate manager pattern, this service handles both connection
 * management and provides convenient methods for common Redis operations.
 *
 * @packageDocumentation
 */

import { Injectable, Inject } from "@abdokouta/react-di";
import type {
  RedisConnection,
  RedisConfig,
  RedisConnector,
  IRedisService,
} from "@/interfaces";
import { REDIS_CONFIG, REDIS_CONNECTOR } from "@/constants/tokens.constant";

/**
 * Redis service for connection management and operations
 *
 * @remarks
 * This service provides:
 * - Automatic connection management with lazy initialization
 * - Multiple named connections support
 * - Connection pooling and reuse
 * - Graceful cleanup and disconnection
 *
 * The service is injectable and integrates with @abdokouta/react-di's
 * dependency injection system.
 *
 * @example
 * ```typescript
 * // In a component or service
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     private readonly redisService: RedisService
 *   ) {}
 *
 *   async cacheUser(user: User): Promise<void> {
 *     const connection = await this.redisService.connection('cache');
 *     await connection.set(
 *       `user:${user.id}`,
 *       JSON.stringify(user),
 *       { ex: 3600 }
 *     );
 *   }
 *
 *   async getUser(id: string): Promise<User | null> {
 *     const connection = await this.redisService.connection('cache');
 *     const data = await connection.get(`user:${id}`);
 *     return data ? JSON.parse(data) : null;
 *   }
 * }
 * ```
 */
@Injectable()
export class RedisService implements IRedisService {
  /**
   * Internal cache of active connections
   *
   * @remarks
   * Connections are stored by name to avoid creating duplicate connections.
   * Once a connection is established, it's reused for subsequent requests.
   */
  private readonly connections: Map<string, RedisConnection> = new Map();

  /**
   * Create a new Redis service
   *
   * @param config - The Redis configuration with connection settings
   * @param connector - The connector used to create new connections
   *
   * @remarks
   * This constructor is called by the DI container. The config and connector
   * are injected automatically based on the module configuration.
   */
  constructor(
    @Inject(REDIS_CONFIG) private readonly config: RedisConfig,
    @Inject(REDIS_CONNECTOR) private readonly connector: RedisConnector,
  ) {}

  /**
   * Get a Redis connection by name
   *
   * @param name - The connection name (optional, defaults to the configured default)
   * @returns A promise that resolves to the Redis connection
   *
   * @throws {Error} If the connection name is not configured
   *
   * @remarks
   * This method implements lazy connection initialization:
   * - First call: Creates and caches the connection
   * - Subsequent calls: Returns the cached connection
   *
   * This approach ensures connections are only created when needed and
   * reused efficiently.
   *
   * @example
   * ```typescript
   * // Get the default connection
   * const redis = await redisService.connection();
   *
   * // Get a specific named connection
   * const cache = await redisService.connection('cache');
   * const session = await redisService.connection('session');
   * ```
   */
  async connection(name?: string): Promise<RedisConnection> {
    // Use the default connection if no name is provided
    const connectionName = name ?? this.config.default;

    // Return cached connection if it exists
    if (this.connections.has(connectionName)) {
      return this.connections.get(connectionName)!;
    }

    // Create, cache, and return new connection
    const connection = await this.resolveConnection(connectionName);
    this.connections.set(connectionName, connection);

    return connection;
  }

  /**
   * Resolve a connection by name
   *
   * @param name - The connection name to resolve
   * @returns A promise that resolves to a new Redis connection
   *
   * @throws {Error} If the connection name is not configured
   *
   * @remarks
   * This is an internal method that:
   * 1. Looks up the connection configuration by name
   * 2. Validates that the configuration exists
   * 3. Uses the connector to create a new connection
   * 4. Returns the connection ready for use
   *
   * @internal
   */
  private async resolveConnection(name: string): Promise<RedisConnection> {
    // Look up the connection configuration
    const connectionConfig = this.config.connections[name];

    // Validate that the connection is configured
    if (!connectionConfig) {
      throw new Error(
        `Redis connection [${name}] not configured. ` +
          `Available connections: ${Object.keys(this.config.connections).join(", ")}`,
      );
    }

    // Create the connection using the connector
    return this.connector.connect(connectionConfig);
  }

  /**
   * Disconnect a specific connection
   *
   * @param name - The connection name to disconnect (optional, defaults to the configured default)
   *
   * @remarks
   * This method:
   * 1. Looks up the connection in the cache
   * 2. Calls disconnect() on the connection
   * 3. Removes it from the cache
   *
   * If the connection doesn't exist or was never created, this is a no-op.
   *
   * For Upstash HTTP connections, disconnect() is a no-op since there are
   * no persistent connections, but this method is provided for consistency
   * and future compatibility.
   *
   * @example
   * ```typescript
   * // Disconnect the default connection
   * await redisService.disconnect();
   *
   * // Disconnect a specific connection
   * await redisService.disconnect('cache');
   * ```
   */
  async disconnect(name?: string): Promise<void> {
    const connectionName = name ?? this.config.default;
    const connection = this.connections.get(connectionName);

    if (connection) {
      await connection.disconnect();
      this.connections.delete(connectionName);
    }
  }

  /**
   * Disconnect all active connections
   *
   * @remarks
   * This method is useful for cleanup during application shutdown.
   * It disconnects all cached connections in parallel and clears the cache.
   *
   * For Upstash HTTP connections, this is mostly a no-op since there are
   * no persistent connections, but it's provided for consistency and to
   * properly clean up the internal cache.
   *
   * @example
   * ```typescript
   * // During application shutdown
   * await redisService.disconnectAll();
   * ```
   */
  async disconnectAll(): Promise<void> {
    // Disconnect all connections in parallel
    await Promise.all(
      Array.from(this.connections.values()).map((conn) => conn.disconnect()),
    );

    // Clear the connection cache
    this.connections.clear();
  }

  /**
   * Get the list of configured connection names
   *
   * @returns An array of connection names
   *
   * @remarks
   * Useful for debugging or displaying available connections to users.
   *
   * @example
   * ```typescript
   * const names = redisService.getConnectionNames();
   * console.log('Available connections:', names);
   * // Output: ['cache', 'session', 'ratelimit']
   * ```
   */
  getConnectionNames(): string[] {
    return Object.keys(this.config.connections);
  }

  /**
   * Get the default connection name
   *
   * @returns The name of the default connection
   *
   * @remarks
   * This is the connection that will be used when no name is specified
   * in the connection() method.
   *
   * @example
   * ```typescript
   * const defaultName = redisService.getDefaultConnectionName();
   * console.log('Default connection:', defaultName); // 'cache'
   * ```
   */
  getDefaultConnectionName(): string {
    return this.config.default;
  }

  /**
   * Check if a connection is currently active (cached)
   *
   * @param name - The connection name to check (optional, defaults to the configured default)
   * @returns True if the connection is active, false otherwise
   *
   * @remarks
   * A connection is considered active if it has been created and cached.
   * This doesn't necessarily mean the connection is "connected" in the
   * traditional sense (since Upstash uses HTTP), but rather that the
   * connection object exists and is ready to use.
   *
   * @example
   * ```typescript
   * if (redisService.isConnectionActive('cache')) {
   *   console.log('Cache connection is ready');
   * }
   * ```
   */
  isConnectionActive(name?: string): boolean {
    const connectionName = name ?? this.config.default;
    return this.connections.has(connectionName);
  }
}
