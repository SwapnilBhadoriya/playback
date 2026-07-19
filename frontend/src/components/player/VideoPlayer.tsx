import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtubeApi";

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

export interface VideoPlayerProps {
  youtubeId: string;
  onTimeUpdate?: (seconds: number) => void;
  onReady?: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ youtubeId, onTimeUpdate, onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YT.Player | null>(null);

    useEffect(() => {
      let cancelled = false;
      let pollInterval: ReturnType<typeof setInterval> | undefined;

      loadYouTubeIframeApi().then((YTApi) => {
        if (cancelled || !containerRef.current) return;

        playerRef.current = new YTApi.Player(containerRef.current, {
          videoId: youtubeId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              onReady?.();
              if (onTimeUpdate) {
                pollInterval = setInterval(() => {
                  const time = playerRef.current?.getCurrentTime() ?? 0;
                  onTimeUpdate(time);
                }, 500);
              }
            },
          },
        });
      });

      return () => {
        cancelled = true;
        if (pollInterval) clearInterval(pollInterval);
        playerRef.current?.destroy();
        playerRef.current = null;
      };
    }, [youtubeId, onReady, onTimeUpdate]);

    useImperativeHandle(
      ref,
      () => ({
        seekTo: (seconds) => playerRef.current?.seekTo(seconds, true),
        play: () => playerRef.current?.playVideo(),
        pause: () => playerRef.current?.pauseVideo(),
        getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      }),
      [],
    );

    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <div ref={containerRef} className="size-full" />
      </div>
    );
  },
);
