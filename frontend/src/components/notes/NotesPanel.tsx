import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExportButtons } from "@/components/notes/ExportButtons";
import { NoteSectionCard } from "@/components/notes/NoteSectionCard";
import type { NoteSection } from "@/types/notes";

export interface NotesPanelProps {
  sections: NoteSection[];
  onSeek: (seconds: number) => void;
}

function sectionMatches(section: NoteSection, query: string): boolean {
  if (section.title.toLowerCase().includes(query)) return true;
  return section.blocks.some((block) => {
    if (block.type === "paragraph") return block.text.toLowerCase().includes(query);
    if (block.type === "code") return block.code.toLowerCase().includes(query);
    return block.points.some(
      (p) => p.label.toLowerCase().includes(query) || p.value.toLowerCase().includes(query),
    );
  });
}

export function NotesPanel({ sections, onSeek }: NotesPanelProps) {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections.filter((section) => sectionMatches(section, q));
  }, [sections, query]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Generated Notes</h3>
        </div>
        <ExportButtons sections={sections} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in notes..."
          className="h-9 pl-8 text-sm"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)] min-h-96 pr-2">
        <div className="flex flex-col gap-4">
          {filteredSections.map((section) => (
            <NoteSectionCard key={section.id} section={section} onSeek={onSeek} />
          ))}
          {filteredSections.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notes match your search.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
