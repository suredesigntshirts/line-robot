import type { UpcomingItem } from "@line-robot/shared";
import type { CatalogRepository } from "../ports/catalog.js";
import { propertyTitle } from "./views.js";

/**
 * The user's outstanding follow-ups across every listing they can see, soonest first — the shared
 * fan-out behind both the chat assistant's "Upcoming" command and the mini-app read API. Resolves
 * the user's listings, collects each one's un-notified events (a fired reminder drops out), titles
 * them, and sorts by due time. Pure read; the caller renders the rows (LINE message vs. JSON).
 */
export async function collectUpcoming(
  catalog: CatalogRepository,
  userId: string,
): Promise<UpcomingItem[]> {
  const properties = await catalog.listPropertiesForUser(userId);
  const rows: UpcomingItem[] = [];
  await Promise.all(
    properties.map(async (property) => {
      const events = await catalog.listPropertyEvents(property.propertyId);
      for (const event of events) {
        if (event.notifiedAt === undefined) {
          rows.push({
            propertyId: property.propertyId,
            propertyTitle: propertyTitle(property),
            dueAt: event.dueAt,
            ...(event.title !== undefined ? { title: event.title } : {}),
          });
        }
      }
    }),
  );
  rows.sort((a, b) => a.dueAt - b.dueAt);
  return rows;
}
