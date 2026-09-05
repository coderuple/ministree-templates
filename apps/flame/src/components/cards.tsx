import Link from "next/link";
import type { EventListItem, PostListItem, Sermon } from "@ministree/template-sdk";
import { formatDate, formatDateRange } from "@/lib/format";
import { loadLocale } from "@/lib/ministree";

function CardImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-panel">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.05] group-hover:opacity-100" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_60%_120%,_color-mix(in_srgb,var(--flame)_45%,transparent),transparent_60%)]" />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [box-shadow:inset_0_-80px_60px_-40px_color-mix(in_srgb,var(--ember)_55%,transparent)]" />
    </div>
  );
}

export function SermonCard({ sermon, href }: { sermon: Sermon; href: string }) {
  return (
    <Link href={href} data-cursor className="group block border border-line bg-surface/40 transition-colors duration-500 hover:border-ember/60">
      <CardImage src={sermon.thumbnailUrl} alt={sermon.title} />
      <div className="space-y-2 p-6">
        <p className="micro text-ember">{sermon.seriesName ?? "Message"}</p>
        <h3 className="font-display text-2xl uppercase leading-[0.98] tracking-tight transition-colors group-hover:text-ember">
          {sermon.title}
        </h3>
        <p className="text-sm text-muted">
          {[sermon.speaker, sermon.date].filter(Boolean).join(" · ")}
          {sermon.duration ? ` · ${sermon.duration}` : ""}
        </p>
      </div>
    </Link>
  );
}

export async function EventCard({ event, href }: { event: EventListItem; href: string }) {
  const day = new Date(event.startAt);
  return (
    <Link href={href} data-cursor className="group flex items-stretch gap-6 border border-line bg-surface/40 p-5 transition-colors duration-500 hover:border-ember/60">
      <div className="grid w-20 shrink-0 place-items-center border border-line bg-bg text-center">
        <div>
          <p className="micro text-ember">{day.toLocaleDateString("en-US", { month: "short" })}</p>
          <p className="font-display text-3xl leading-none">{Number.isNaN(day.getTime()) ? "·" : day.getDate()}</p>
        </div>
      </div>
      <div className="min-w-0 space-y-1.5 py-1">
        <p className="micro text-muted">{formatDateRange(event.startAt, event.endAt, await loadLocale())}</p>
        <h3 className="font-display text-2xl uppercase leading-[0.98] tracking-tight transition-colors group-hover:text-ember">
          {event.title ?? "Untitled event"}
        </h3>
        {event.location ? <p className="text-sm text-muted">{event.location}</p> : null}
      </div>
    </Link>
  );
}

export async function PostCard({ post, href }: { post: PostListItem; href: string }) {
  return (
    <Link href={href} data-cursor className="group block border border-line bg-surface/40 transition-colors duration-500 hover:border-ember/60">
      <CardImage src={post.featuredImageUrl} alt={post.title} />
      <div className="space-y-2 p-6">
        <p className="micro text-ember">{post.category ?? "Journal"}</p>
        <h3 className="font-display text-2xl uppercase leading-[0.98] tracking-tight transition-colors group-hover:text-ember">
          {post.title}
        </h3>
        {post.excerpt ? <p className="line-clamp-2 text-sm text-muted">{post.excerpt}</p> : null}
        {post.publishedAt ? <p className="micro text-muted">{formatDate(post.publishedAt, await loadLocale())}</p> : null}
      </div>
    </Link>
  );
}
