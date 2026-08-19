"use client";

import { useState } from "react";

/** Tap-to-copy value (used by the Ways-to-give bank rows). */
export function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      data-cursor
      onClick={() => {
        if (typeof navigator === "undefined" || !navigator.clipboard) return;
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className="font-medium transition-colors hover:text-ember"
      aria-label={`Copy ${value}`}
    >
      {copied ? "Copied ✓" : value}
    </button>
  );
}
