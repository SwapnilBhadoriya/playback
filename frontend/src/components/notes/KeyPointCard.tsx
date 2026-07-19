import type { NoteKeyPoint } from "@/types/notes";

export function KeyPointCard({ point }: { point: NoteKeyPoint }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-sm font-semibold text-foreground">{point.label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{point.value}</p>
    </div>
  );
}
