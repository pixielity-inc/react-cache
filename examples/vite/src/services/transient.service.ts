import { Injectable, Inject } from "@abdokouta/react-di";
import { LOGGER_SERVICE } from "@/constants";

/**
 * Transient-scoped service example
 * A new instance is created every time it's injected
 */
@Injectable()
export class TransientService {
  private instanceId: string;
  private createdAt: number;

  constructor(@Inject(LOGGER_SERVICE) private logger: any) {
    this.instanceId = Math.random().toString(36).substring(7);
    this.createdAt = Date.now();
    this.logger.info(`TransientService instance created: ${this.instanceId}`);
  }

  getInstanceId(): string {
    return this.instanceId;
  }

  getCreatedAt(): number {
    return this.createdAt;
  }

  doWork(task: string): string {
    this.logger.log(`Instance ${this.instanceId} doing: ${task}`);
    return `Done by ${this.instanceId}`;
  }
}
