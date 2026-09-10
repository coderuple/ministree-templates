import { resolveEntities, type EventDetail } from "@ministree/template-sdk";
import { eventSource, resolveEventRecord } from "@ministree-templates/event-kit/overrides";

/**
 * The event a single-event site is built around, or null.
 *
 * Already resolved against the Customizer's choice of where the details come
 * from — the picked event as it is, the picked event with details changed, or
 * details typed by hand — so the page and `generateMetadata` can never
 * disagree about what the event is called. See event-kit's `overrides.ts`.
 *
 * Shared by the page and by `generateMetadata`, which Next calls separately —
 * React's per-request `cache()` inside the SDK means the second caller reuses
 * the first one's fetch rather than asking Ministree twice for the same event.
 */
export async function loadFeaturedEvent(content: unknown): Promise<EventDetail | null> {
  const c = content as { siteMode?: string; featuredEvent?: string };
  if (c?.siteMode !== "singleEvent") return null;
  /* Typing the details by hand hides the picker, but the slug it last held is
     still saved. A field nobody can see must never decide what the site says. */
  const record =
    eventSource(content) !== "manual" && c.featuredEvent
      ? ((await resolveEntities<EventDetail>(undefined, "events", c.featuredEvent))[0] ?? null)
      : null;
  return resolveEventRecord(record, content);
}
