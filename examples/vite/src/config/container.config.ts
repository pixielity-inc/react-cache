/**
 * @fileoverview Container Configuration
 *
 * Default configuration values for the DI container.
 *
 * @module @abdokouta/ts-container
 * @category Config
 */
import { defineConfig } from '@abdokouta/ts-container';

/**
 * Default container configuration
 *
 * These values are used when no explicit configuration is provided.
 */
export const containerConfig = defineConfig({
  /**
   * Default log level
   * Change to "debug" for detailed logs, "none" to disable logging
   */
  logLevel: 'debug',

  /**
   * Default scope for providers
   */
  defaultScope: 'Singleton',
});
