"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { magneticDisabled } from "@/lib/motion";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "dark";
  className?: string;
  external?: boolean;
};

export default function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: Props) {
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    /* Nothing to set an end state to — the button's resting position IS the end
       state, so declining to move it is the whole fix. onLeave then tweens 0→0,
       and is deliberately NOT guarded: if the switch flips while a button is
       mid-lean, onLeave is the only thing that puts it back. */
    if (magneticDisabled()) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(innerRef.current, {
      x: x * 0.3,
      y: y * 0.35,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const onLeave = () => {
    gsap.to(innerRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const base =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-[var(--radius-button)] px-8 py-4 text-xs uppercase tracking-[0.25em] transition-colors duration-500";
  const styles =
    variant === "primary"
      ? "bg-ember text-bg"
      : variant === "dark"
        ? "bg-bg text-ink"
        : variant === "ghost"
          /* `currentColor`, not `text-ink`. These two variants have no fill, so
             they sit on whatever is behind them — and the hero is an inverted
             panel. Forcing the light-mode ink painted dark text on a dark
             photograph, which is how "Watch a message" became unreadable. The
             panel already sets `text-panel-ink`; inheriting it is the fix. */
          ? "text-current hover:text-ember"
          : "border border-current/35 text-current hover:border-ember"; // outline

  const hasFill = variant === "primary" || variant === "dark";

  return (
    <a
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} ${styles} ${className}`}
    >
      {hasFill && (
        <span
          className={`absolute inset-0 origin-center scale-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-150 ${
            variant === "dark" ? "bg-ink" : "bg-flame"
          }`}
        />
      )}
      <span
        ref={innerRef}
        className={`relative z-10 inline-flex items-center gap-3 ${
          variant === "dark"
            ? "transition-colors duration-500 group-hover:text-bg"
            : ""
        }`}
      >
        {children}
      </span>
    </a>
  );
}
