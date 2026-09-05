"use client";

import { useEffect, useRef, useState } from "react";
import { lenisStore } from "@/lib/state";
import type { LineupPerson } from "@/components/event/sections/EventLineup";

/**
 * A speaker's card — native <dialog>, deep-linkable via ?speaker=<slug>.
 *
 * Native rather than a div: `showModal()` gives the focus trap, the Escape key,
 * the inert background and `::backdrop` for free, and gets all four right in
 * ways a hand-rolled modal usually doesn't.
 *
 * Desktop: portrait beside the bio. Phones: the visual fills the card and the
 * name rides a scrim over it, with "Read bio" sliding the text across — a bio
 * column squeezed into 390px is unreadable, and a phone is where most of these
 * links get opened.
 *
 * The URL is rewritten on open and cleaned on close, so any card can be sent to
 * someone as a link. `EventLineup` reads the parameter back on mount.
 */
export default function SpeakerModal({
  person,
  people,
  venueLabel,
  onClose,
}: {
  person: LineupPerson | null;
  /** The full lineup, for the "03 / 07" slate. */
  people: LineupPerson[];
  /** Where they are appearing. Omitted when the event has no venue named. */
  venueLabel: string | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [bioOpen, setBioOpen] = useState(false);
  const index = person ? people.findIndex((p) => p.slug === person.slug) : -1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !person) return;

    setBioOpen(false);
    dialog.showModal();
    document.documentElement.setAttribute("data-modal", "");
    lenisStore.current?.stop();
    const url = new URL(window.location.href);
    url.searchParams.set("speaker", person.slug);
    history.replaceState(null, "", url);

    /* Unconditional teardown. An unmount with the card open — a preview reload,
       a navigation — would otherwise leave the page permanently unscrollable
       and Lenis stopped, with no visible cause. */
    return () => {
      dialog.close();
      document.documentElement.removeAttribute("data-modal");
      lenisStore.current?.start();
      const clean = new URL(window.location.href);
      clean.searchParams.delete("speaker");
      history.replaceState(null, "", clean);
    };
  }, [person]);

  if (!person) return null;

  const slate = (
    <p className="micro text-ember">
      Speaker — {String(index + 1).padStart(2, "0")} /{" "}
      {String(people.length).padStart(2, "0")}
    </p>
  );

  const bioBody = (
    <>
      <div>
        <h3 className="font-display text-4xl uppercase leading-[0.95] md:text-6xl">
          {person.name}
        </h3>
        {person.role ? <p className="micro mt-3 text-muted">{person.role}</p> : null}
      </div>

      <div className="h-px w-16 bg-ember" />

      {person.bio ? (
        <p className="max-w-prose leading-relaxed text-ink/85">{person.bio}</p>
      ) : null}

      {venueLabel ? (
        <p className="font-serif text-2xl italic text-ink">Live at {venueLabel}</p>
      ) : null}
    </>
  );

  return (
    <dialog
      ref={dialogRef}
      className="speaker-card"
      aria-label={`${person.name} — speaker`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose(); // backdrop click
      }}
    >
      <div className="relative grid md:grid-cols-[minmax(0,42%)_1fr]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor
          className="absolute right-4 top-4 z-30 flex size-10 items-center justify-center rounded-full border border-ink/40 bg-bg/60 text-ink backdrop-blur-sm transition-colors hover:border-ember"
        >
          ✕
        </button>

        {/* ── the portrait ── */}
        <div className="relative h-dvh w-full overflow-hidden bg-bg md:aspect-[9/16] md:h-auto md:max-h-[90dvh]">
          {person.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.image}
              alt={person.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-surface" />
          )}

          {/* Phones: the name rides a tall scrim so it always beats whatever the
              picture is doing behind it. */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-2.5 bg-gradient-to-t from-bg from-25% via-bg/75 via-65% to-transparent p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-32 md:hidden">
            {slate}
            <p className="font-display text-4xl uppercase leading-[0.95] text-ink">
              {person.name}
            </p>
            {person.role ? <p className="micro text-muted">{person.role}</p> : null}
            {person.bio ? (
              <button
                type="button"
                onClick={() => setBioOpen(true)}
                className="micro mt-2 rounded-[var(--radius-button)] bg-ember px-6 py-3 text-bg"
              >
                Read bio
              </button>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-bg/50 via-transparent to-transparent md:block" />
        </div>

        {/* ── desktop bio column ── */}
        <div className="relative hidden flex-col gap-5 overflow-y-auto p-10 md:flex md:max-h-[90dvh]">
          {slate}
          {bioBody}
        </div>

        {/* ── mobile bio sheet ── */}
        {bioOpen ? (
          <div className="absolute inset-0 z-20 flex flex-col items-start gap-5 overflow-y-auto bg-surface p-7 pt-16 md:hidden">
            <button
              type="button"
              onClick={() => setBioOpen(false)}
              className="micro w-max rounded-[var(--radius-button)] border border-line px-5 py-2.5 text-muted transition-colors hover:text-ink"
            >
              ← Back
            </button>
            {slate}
            {bioBody}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
