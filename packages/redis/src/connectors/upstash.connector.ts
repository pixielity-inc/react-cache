/**
 * Upstash Redis connector
 *
 * @remarks
 * Creates Upstash Redis connections from configuration.
 * This connector initializes the Upstash HTTP client and wraps it
 * in our connection interface.
 *
 * @packageDocumentation
 */

import { Redis } from "@upstash/redis";
import { Injectable } from "@abdokouta/react-di";
import { UpstashConnection } from "@/connections/upstash.connection";
import type {
  RedisConnector,
  RedisConnection,
  RedisConnectionConfig,
} from "@/interfaces";

/**
 * Upstash Redis connector implementation
 *
 * @remarks
 * This connector creates browser-compatible Redis connections using
 * the Upstash HTTP REST API. It handles client initialization and
 * configuration.
 *
 * The connector is injectable and can be used with dependency injection
 * frameworks like @abdokouta/react-di.
 *
 * @example
 * ```typescript
 * const connector = new UpstashConnector();
 *
 * const connection = await connector.connect({
 *   url: 'https://my-redis.upstash.io',
 *   token: 'my-token',
 *   timeout: 5000,
 *   retry: {
 *     retries: 3,
 *     backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000)
 *   }
 * });
 *
 * // Use the connection
 * await connection.set('key', 'value');
 * ```
 */
@Injectable()
export class UpstashConnector implements RedisConnector {
  /**
   * Create a Redis connection from configuration
   *
   * @param config - The Upstash Redis configuration
   * @returns A promise that resolves to a Redis connection
   *
   * @throws {Error} If the configuration is invalid or connection fails
   *
   * @remarks
   * This method:
   * 1. Validates the configuration
   * 2. Creates an Upstash Redis HTTP client
   * 3. Wraps it in our connection interface
   * 4. Returns the connection ready for use
   *
   * The connection is lazy - it doesn't actually connect until the first
   * operation is performed (since HTTP is connectionless).
   */
  async connect(config: RedisConnectionConfig): Promise<RedisConnection> {
    // Validate required configuration
    if (!config.url) {
      throw new Error("Redis URL is required");
    }

    if (!config.token) {
      throw new Error("Redis token is required");
    }

    // Create Upstash Redis HTTP client
    const client = new Redis({
      url: config.url,
      token: config.token,
      retry: config.retry,
      enableAutoPipelining: config.enableAutoPipelining,
      // Note: Upstash client doesn't have a timeout option in the constructor
      // Timeout is handled per-request if needed
    });

    // Wrap in our connection interface
    // Use 'default' as the name since this is a single connection
    // The actual name will be set by RedisManager
    return new UpstashConnection(client, "default");
  }
}
