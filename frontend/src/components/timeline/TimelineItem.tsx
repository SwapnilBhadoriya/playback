import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import type { TimelineChapter } from "@/types/timeline";

export interface TimelineItemProps {
  chapter: TimelineChapter;
  isActive: boolean;
  onSeek: (seconds: number) => void;
}

export function TimelineItem({ chapter, isActive, onSeek }: TimelineItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSeek(chapter.startSeconds)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-accent",
        isActive && "border-primary/40 bg-primary/10",
      )}
    >
      <span
        className={cn(
          "flex size-2 shrink-0 rounded-full",
          isActive ? "bg-primary" : "bg-border",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>
          {chapter.title}
        </p>
        {chapter.summary && (
          <p className="truncate text-xs text-muted-foreground">{chapter.summary}</p>
        )}
      </div>
      <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
        {isActive && <Play className="size-3 fill-primary text-primary" />}
        {formatTimestamp(chapter.startSeconds)}
      </span>
    </button>
  );
}
