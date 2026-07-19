import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format";
import { NoteBlockRenderer } from "@/components/notes/NoteBlockRenderer";
import type { NoteSection } from "@/types/notes";

export interface NoteSectionCardProps {
  section: NoteSection;
  onSeek: (seconds: number) => void;
}

export function NoteSectionCard({ section, onSeek }: NoteSectionCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSeek(section.startTimestamp);
            }}
            className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Play className="size-3" />
            {formatTimestamp(section.startTimestamp)}
          </button>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-4">
          {section.blocks.map((block, idx) => (
            <NoteBlockRenderer key={`${section.id}-${idx}`} block={block} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
