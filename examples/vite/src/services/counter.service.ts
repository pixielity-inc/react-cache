import { Injectable, Inject } from "@abdokouta/react-di";
import { LOGGER_SERVICE } from "@/constants";

@Injectable()
export class CounterService {
  private count = 0;
  private listeners: Array<(count: number) => void> = [];

  constructor(@Inject(LOGGER_SERVICE) private logger: any) {
    this.logger.info("CounterService initialized");
  }

  getCount(): number {
    return this.count;
  }

  increment(): void {
    this.count++;
    this.logger.log("Counter incremented", this.count);
    this.notifyListeners();
  }

  decrement(): void {
    this.count--;
    this.logger.log("Counter decremented", this.count);
    this.notifyListeners();
  }

  reset(): void {
    this.count = 0;
    this.logger.log("Counter reset");
    this.notifyListeners();
  }

  subscribe(listener: (count: number) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.count));
  }
}
