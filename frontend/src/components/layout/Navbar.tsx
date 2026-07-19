import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  const isVideosActive = location.pathname.startsWith("/videos");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-semibold text-foreground">Playback</span>
            <Badge variant="secondary" className="ml-1 gap-1 text-[10px] font-semibold uppercase">
              AI
            </Badge>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/videos"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
                isVideosActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Videos
            </Link>
          </nav>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
