import { Module, Global } from "@abdokouta/react-di";
import { LoggerService } from "@/services/logger.service";
import { LOGGER_SERVICE } from "@/constants";

/**
 * Global Logger Module
 *
 * Provides LoggerService globally to all modules without explicit imports.
 * This is a common pattern for infrastructure services like logging.
 */
@Global()
@Module({
  providers: [{ provide: LOGGER_SERVICE, useClass: LoggerService }],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}
