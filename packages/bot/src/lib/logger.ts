import { Logger as PowertoolsLogger } from "@aws-lambda-powertools/logger";
import type { Logger } from "../core/ports/runtime.js";

/** Adapts AWS Lambda Powertools' structured logger to our {@link Logger} port. */
export class PowertoolsLoggerAdapter implements Logger {
  constructor(private readonly logger: PowertoolsLogger = new PowertoolsLogger()) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(message, context ?? {});
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, context ?? {});
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(message, context ?? {});
  }
}
