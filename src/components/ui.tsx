import Link from "next/link";
import type { ReactNode } from "react";

/** Shared layout + UI primitives for flame — token-driven, cinematic. */

export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide";
}) {
  const max = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return <div className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}>{children}</div>;
}

type ButtonVariant = "primary" | "outline" | "ghost";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-7 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-ember text-bg hover:bg-flame",
    outline: "border border-line text-ink hover:border-ember hover:text-ember",
    ghost: "text-ink hover:text-ember",
  };
  const cls = `${base} ${styles[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} data-cursor target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-cursor>
      {children}
    </Link>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="micro text-ember">{children}</span>;
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl ${className}`}>{children}</h2>;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="border border-dashed border-line bg-surface/40 px-6 py-20 text-center">
      <p className="font-display text-2xl uppercase tracking-tight">{title}</p>
      {body ? <p className="font-serif mx-auto mt-3 max-w-md text-lg italic text-muted">{body}</p> : null}
    </div>
  );
}

/** Cinematic masthead for archive + detail pages. */
export function ArchiveHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-surface/40">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 size-72 -translate-y-1/2 rounded-full bg-[var(--ember)]/10 blur-3xl" />
      <Container className="relative py-20 sm:py-28">
        {eyebrow ? <p className="micro text-ember">{eyebrow}</p> : null}
        <h1 className="font-display mt-4 text-6xl uppercase leading-[0.88] tracking-tight sm:text-8xl">{title}</h1>
        {description ? <p className="font-serif mt-5 max-w-2xl text-xl italic text-muted">{description}</p> : null}
      </Container>
    </header>
  );
}

export function Pagination({
  basePath,
  page,
  total,
  limit,
}: {
  basePath: string;
  page: number;
  total: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  const link = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  return (
    <nav className="mt-16 flex items-center justify-between border-t border-line pt-8" aria-label="Pagination">
      {page > 1 ? (
        <Link href={link(page - 1)} className="micro text-ink transition-colors hover:text-ember">
          ← Previous
        </Link>
      ) : (
        <span className="micro text-muted/40">← Previous</span>
      )}
      <span className="micro text-muted">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={link(page + 1)} className="micro text-ink transition-colors hover:text-ember">
          Next →
        </Link>
      ) : (
        <span className="micro text-muted/40">Next →</span>
      )}
    </nav>
  );
}
