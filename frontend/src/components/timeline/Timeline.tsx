import { useMemo, useState } from "react";
import { Search, ListVideo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimelineItem } from "@/components/timeline/TimelineItem";
import type { TimelineChapter } from "@/types/timeline";

export interface TimelineProps {
  chapters: TimelineChapter[];
  activeTimestamp: number | null;
  onSeek: (seconds: number) => void;
}

export function Timeline({ chapters, activeTimestamp, onSeek }: TimelineProps) {
  const [query, setQuery] = useState("");

  const filteredChapters = useMemo(() => {
    if (!query.trim()) return chapters;
    const q = query.toLowerCase();
    return chapters.filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary?.toLowerCase().includes(q),
    );
  }, [chapters, query]);

  const activeChapterId = useMemo(() => {
    if (activeTimestamp === null) return null;
    const match = [...chapters]
      .reverse()
      .find((c) => activeTimestamp >= c.startSeconds);
    return match?.id ?? null;
  }, [chapters, activeTimestamp]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListVideo className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
        </div>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in timeline"
          className="h-8 pl-8 text-xs"
        />
      </div>
      <ScrollArea className="h-72 pr-1">
        <div className="flex flex-col gap-1">
          {filteredChapters.map((chapter) => (
            <TimelineItem
              key={chapter.id}
              chapter={chapter}
              isActive={chapter.id === activeChapterId}
              onSeek={onSeek}
            />
          ))}
          {filteredChapters.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No chapters match your search.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
