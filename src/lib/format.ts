/** Small formatting helpers shared across flame surfaces. */

export function formatDate(value: string | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", opts ?? { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start) return "";
  const left = `${formatDate(start)} · ${formatTime(start)}`;
  return end ? `${left} – ${formatTime(end)}` : left;
}

/** Money in cents → display string. */
export function formatPrice(cents: number | null | undefined, currency = "USD"): string {
  if (cents == null) return "";
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
