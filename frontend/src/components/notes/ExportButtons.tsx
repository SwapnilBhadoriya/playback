import { useState } from "react";
import { Check, Copy, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NoteSection } from "@/types/notes";

export interface ExportButtonsProps {
  sections: NoteSection[];
}

function sectionsToPlainText(sections: NoteSection[]): string {
  return sections
    .map((section) => {
      const body = section.blocks
        .map((block) => {
          if (block.type === "paragraph") return block.text;
          if (block.type === "code") return block.code;
          return block.points.map((p) => `- ${p.label}: ${p.value}`).join("\n");
        })
        .join("\n\n");
      return `## ${section.title}\n\n${body}`;
    })
    .join("\n\n");
}

export function ExportButtons({ sections }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(sectionsToPlainText(sections));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([sectionsToPlainText(sections)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notes.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleCopy}>
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy notes</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleDownload}>
            <Download className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download notes</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>Copy as text</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>Download as .md</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
