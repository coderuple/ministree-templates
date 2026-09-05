import Link from "next/link";
import type { NavNode } from "@ministree/template-sdk";

/** Uppercase, tracked navigation with an ember underline + one level of dropdown. */
export default function Nav({ items, className = "" }: { items: NavNode[]; className?: string }) {
  return (
    <ul className={`flex items-center gap-7 ${className}`}>
      {items.map((item) => (
        <li key={`${item.label}-${item.href}`} className="group relative">
          <Link
            href={item.href || "#"}
            data-cursor
            className="relative inline-flex items-center gap-1 py-2 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors duration-300 hover:text-ember"
          >
            {item.label}
            <span className="pointer-events-none absolute -bottom-px left-0 h-px w-0 bg-ember transition-all duration-300 group-hover:w-full" />
          </Link>
          {item.children?.length ? (
            <ul className="invisible absolute left-0 top-full z-50 min-w-48 border border-line bg-bg p-2 opacity-0 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => (
                <li key={`${child.label}-${child.href}`}>
                  <Link
                    href={child.href || "#"}
                    className="block px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:bg-surface hover:text-ember"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
