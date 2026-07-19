import { Link } from "react-router-dom";
import { Clock, Film } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VideosLibraryPage() {
  const { data: videos, isLoading, isError } = useVideoLibrary();

  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Processed Videos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every video you've generated notes and questions for.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">Could not load your processed videos.</p>
      )}

      {!isLoading && !isError && videos?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <Film className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No videos processed yet. Paste a YouTube URL on the home page to get started.
          </p>
        </div>
      )}

      {!isLoading && !isError && videos && videos.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Link key={video.id} to={`/videos/${video.id}`}>
              <Card className="group overflow-hidden py-0 transition-colors hover:border-primary/50">
                <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Film className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  {video.durationSeconds > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      <Clock className="size-3" />
                      {formatDuration(video.durationSeconds)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{video.title}</p>
                  {video.channelName && (
                    <p className="truncate text-xs text-muted-foreground">{video.channelName}</p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
