/** Publishes raw webhook events onto the async queue (SQS in Stage 03/04). */
export interface QueuePublisher {
  publish(events: readonly unknown[]): Promise<void>;
}

/** Structured logging, backed by AWS Lambda Powertools at the edges. */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/** Injectable time source so handlers stay deterministic and testable. */
export interface Clock {
  now(): number;
}
