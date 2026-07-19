import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface UrlInputBarProps {
  onSubmit: (youtubeUrl: string) => void;
  isSubmitting?: boolean;
  defaultValue?: string;
}

export function UrlInputBar({ onSubmit, isSubmitting, defaultValue }: UrlInputBarProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(defaultValue ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    onSubmit(youtubeUrl.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl flex-col gap-2 sm:flex-row">
      <Input
        type="text"
        required
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="h-11 flex-1"
      />
      <Button type="submit" disabled={isSubmitting} className="h-11 gap-2 px-6">
        <Sparkles className="size-4" />
        {isSubmitting ? "Generating..." : "Generate Notes"}
      </Button>
    </form>
  );
}
