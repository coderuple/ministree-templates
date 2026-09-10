"use client";

/**
 * The cold-page case, branded.
 *
 * The SDK throws when Ministree is unreachable rather than returning empty —
 * so Next keeps the last good page and retries instead of caching a hollowed
 * out one. A page with no cache entry yet lands here. Every string is
 * hardcoded on purpose: this file must render when Ministree cannot be read.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-page">
      <p className="eyebrow">◀◀ NO SIGNAL</p>
      <h1>
        We couldn&apos;t load <em>this page.</em>
      </h1>
      <p>It is usually back within a minute.</p>
      <button type="button" className="btn-outline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
