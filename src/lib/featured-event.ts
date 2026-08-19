import { resolveEntities, type EventDetail } from "@ministree/template-sdk";

/**
 * The event a single-event site is built around, or null.
 *
 * Shared by the page and by `generateMetadata`, which Next calls separately —
 * React's per-request `cache()` inside the SDK means the second caller reuses
 * the first one's fetch rather than asking Ministree twice for the same event.
 */
export async function loadFeaturedEvent(content: unknown): Promise<EventDetail | null> {
  const c = content as { siteMode?: string; featuredEvent?: string };
  if (c?.siteMode !== "singleEvent" || !c.featuredEvent) return null;
  const [event] = await resolveEntities<EventDetail>(undefined, "events", c.featuredEvent);
  return event ?? null;
}
