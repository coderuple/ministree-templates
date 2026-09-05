/** Numbered rule above each section — the spine of the single-event layout. */
export default function SectionHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-5">
      <span className="font-display text-sm text-ember">{index}</span>
      <span className="h-px flex-1 bg-line" />
      <span className="micro text-muted">{label}</span>
    </div>
  );
}
