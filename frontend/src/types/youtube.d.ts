export {};

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }

  namespace YT {
    class Player {
      constructor(elementId: string | HTMLElement, options: PlayerOptions);
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      playVideo(): void;
      pauseVideo(): void;
      getCurrentTime(): number;
      destroy(): void;
    }

    interface PlayerOptions {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: { data: number; target: Player }) => void;
      };
    }
  }
}
