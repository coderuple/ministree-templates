"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

/**
 * Shown when a page can't be rendered — in practice, when Ministree is
 * unreachable and this page had no cached copy to fall back on.
 *
 * Deliberately hardcoded, with no church data in it. Every other surface reads
 * its copy from Ministree, which is exactly the thing that just failed; fetching
 * here would fail too and leave the visitor on Next's raw error screen. It also
 * can't use `notFound()`'s wording — telling a search engine a sermon is gone
 * because the API blinked is how a church loses its indexed pages.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // The error itself is already logged server-side by the SDK client.
  }, []);

  return (
    <Container className="py-32 text-center sm:py-40">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        This page isn&rsquo;t loading right now
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Something went wrong on our end. It&rsquo;s usually brief — try again in a moment.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ember px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-bg"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-line px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ink"
        >
          Back home
        </a>
      </div>
    </Container>
  );
}
