import { Injectable } from "@abdokouta/react-di";

@Injectable()
export class LoggerService {
  log(message: string, ...args: unknown[]) {
    console.log(`[LOG]: ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(`[ERROR]: ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]) {
    console.info(`[INFO]: ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN]: ${message}`, ...args);
  }
}
