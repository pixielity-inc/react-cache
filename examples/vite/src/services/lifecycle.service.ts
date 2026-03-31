import {
  Injectable,
  Inject,
  type OnModuleInit,
  type OnModuleDestroy,
} from "@abdokouta/react-di";
import { LOGGER_SERVICE } from "@/constants";

/**
 * Service with lifecycle hooks demonstration
 * Shows initialization and cleanup patterns
 *
 * Implements OnModuleInit and OnModuleDestroy interfaces
 * These methods are called by the module's onActivation and onDeactivation hooks
 */
@Injectable()
export class LifecycleService implements OnModuleInit, OnModuleDestroy {
  private isInitialized = false;
  private resources: string[] = [];
  private cleanupCallbacks: Array<() => void> = [];

  constructor(@Inject(LOGGER_SERVICE) private logger: any) {
    this.logger.info("LifecycleService constructor called");
  }

  /**
   * OnModuleInit implementation
   * Called by module's onActivation hook after construction
   * Use for async setup, resource allocation, etc.
   */
  onModuleInit(): void {
    this.logger.info(
      "LifecycleService.onModuleInit() - Initializing resources...",
    );

    // Simulate initialization (sync version for demo)
    this.resources.push("Database Connection");
    this.resources.push("Cache Connection");
    this.resources.push("Message Queue");

    this.isInitialized = true;
    this.logger.info(
      "LifecycleService.onModuleInit() - Initialization complete",
    );
  }

  /**
   * OnModuleDestroy implementation
   * Called by module's onDeactivation hook before destruction
   * Use for cleanup, closing connections, etc.
   */
  onModuleDestroy(): void {
    this.logger.info(
      "LifecycleService.onModuleDestroy() - Cleaning up resources...",
    );

    // Clean up resources
    this.resources.forEach((resource) => {
      this.logger.log(`Releasing: ${resource}`);
    });

    // Call cleanup callbacks
    this.cleanupCallbacks.forEach((callback) => callback());

    this.resources = [];
    this.isInitialized = false;
    this.logger.info("LifecycleService.onModuleDestroy() - Cleanup complete");
  }

  getStatus(): { initialized: boolean; resources: string[] } {
    return {
      initialized: this.isInitialized,
      resources: [...this.resources],
    };
  }

  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }
}
