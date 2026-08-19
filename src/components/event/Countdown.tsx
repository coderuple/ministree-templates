"use client";

import { useEffect, useState } from "react";

/**
 * Time remaining until the event starts.
 *
 * Rendered only after mount: the server and the browser are in different moments
 * (and often different timezones), so server-rendering a live clock guarantees a
 * hydration mismatch and a flash of the wrong number. The reserved height keeps
 * the layout from jumping when it appears.
 *
 * Once the event has started this says so rather than counting into negatives.
 */
function parts(msRemaining: number) {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export default function Countdown({ startAt, label }: { startAt: string; label?: string }) {
  const target = new Date(startAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    /* The first reading has to happen on the client. A server-rendered clock is
       stale before the HTML arrives and guarantees a hydration mismatch, which
       is why `now` starts null and the markup reserves its height instead. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  // Reserve the space on the server pass so nothing shifts when the clock lands.
  if (now === null) return <div aria-hidden className="h-24" />;

  const remaining = target - now;
  if (remaining <= 0) {
    return (
      <p className="micro text-ember" role="status">
        Happening now
      </p>
    );
  }

  const { days, hours, minutes, seconds } = parts(remaining);
  const units = [
    { value: days, label: days === 1 ? "day" : "days" },
    { value: hours, label: hours === 1 ? "hour" : "hours" },
    { value: minutes, label: minutes === 1 ? "min" : "mins" },
    { value: seconds, label: "sec" },
  ];

  return (
    <div>
      {label ? <p className="micro mb-3 text-ember">{label}</p> : null}
      {/* One quiet announcement of the remaining time, rather than a screen
          reader re-reading four numbers every second. */}
      <p className="sr-only" role="timer" aria-live="off">
        {days} days, {hours} hours and {minutes} minutes until it starts
      </p>
      <div aria-hidden className="flex gap-6 tabular-nums">
        {units.map((unit) => (
          <div key={unit.label}>
            <span className="font-display block text-4xl leading-none sm:text-6xl">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="micro mt-2 block text-muted">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
