import { pushTargetFromKey } from "../core/domain/conversation.js";
import { propertyTitle, reminderMessage } from "../core/handlers/views.js";
import type { CatalogRepository } from "../core/ports/catalog.js";
import type { LineGateway } from "../core/ports/lineGateway.js";
import type { Clock, Logger } from "../core/ports/runtime.js";

export interface ReminderSweepDeps {
  readonly catalog: CatalogRepository;
  readonly gateway: LineGateway;
  readonly logger: Logger;
  readonly clock: Clock;
}

export interface ReminderSweepOptions {
  /** Max events to notify per run (bounds one invocation's work). */
  readonly maxEvents?: number;
}

/** Tallies one reminder run — returned for the Lambda log line and asserted in tests. */
export interface ReminderResult {
  /** Events the GSI2 reported as due. */
  readonly due: number;
  /** Reminders this run pushed (won the notify-claim for). */
  readonly sent: number;
  /** Events skipped because another sweep had already notified them. */
  readonly skipped: number;
  /** Events that errored mid-run (claimed but the push threw). */
  readonly failed: number;
}

const DEFAULT_MAX_EVENTS = 50;

/**
 * The reminder sweep, invoked on an EventBridge cron. Finds follow-up events past their due time
 * (sparse GSI2, no scan), claims each one atomically (so a reminder is pushed at most once even if
 * two sweeps overlap), and pushes a reminder to the conversation the follow-up was set in. Pure
 * orchestration over ports — fully unit-testable with fakes.
 */
export class ReminderSweep {
  constructor(
    private readonly deps: ReminderSweepDeps,
    private readonly opts: ReminderSweepOptions = {},
  ) {}

  async run(): Promise<ReminderResult> {
    const maxEvents = this.opts.maxEvents ?? DEFAULT_MAX_EVENTS;
    const nowMs = this.deps.clock.now();
    const nowIso = new Date(nowMs).toISOString();

    const due = await this.deps.catalog.findDueEvents(nowIso, maxEvents);
    if (due.length === 0) {
      this.deps.logger.info("reminder sweep: nothing due", { nowIso });
      return { due: 0, sent: 0, skipped: 0, failed: 0 };
    }

    const tally = { due: due.length, sent: 0, skipped: 0, failed: 0 };
    for (const event of due) {
      // Claim before pushing: winning the conditional mark is the licence to send exactly one
      // reminder. A lost claim means another sweep already sent it.
      const won = await this.deps.catalog.markEventNotified(event, nowMs);
      if (!won) {
        tally.skipped += 1;
        continue;
      }
      try {
        const property = await this.deps.catalog.getProperty(event.propertyId);
        const title = property !== null ? propertyTitle(property) : "your listing";
        const message = reminderMessage(event.propertyId, title, event.dueAt, event.title);
        await this.deps.gateway.push(pushTargetFromKey(event.notifyConversationKey), [message]);
        tally.sent += 1;
      } catch (error) {
        // The event is already marked notified (claimed above), so it won't be retried — log loudly.
        tally.failed += 1;
        this.deps.logger.error("reminder sweep: push failed after claim", {
          eventId: event.eventId,
          propertyId: event.propertyId,
          error: String(error),
        });
      }
    }

    this.deps.logger.info("reminder sweep complete", { ...tally });
    return { ...tally };
  }
}
