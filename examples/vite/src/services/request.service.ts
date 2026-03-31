import { Injectable, Inject } from "@abdokouta/react-di";

import { LOGGER_SERVICE } from "@/constants";

/**
 * Request-scoped service example
 * Each request gets its own instance
 */
@Injectable()
export class RequestService {
  private requestId: string;
  private startTime: number;

  constructor(@Inject(LOGGER_SERVICE) private logger: any) {
    this.requestId = Math.random().toString(36).substring(7);
    this.startTime = Date.now();
    this.logger.info(`RequestService created with ID: ${this.requestId}`);
  }

  getRequestId(): string {
    return this.requestId;
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  processRequest(data: string): string {
    this.logger.log(`Processing request ${this.requestId}: ${data}`);
    return `Processed by ${this.requestId}: ${data}`;
  }
}
