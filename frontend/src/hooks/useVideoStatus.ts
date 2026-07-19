import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVideoStatus, videoStatusStreamUrl } from "../api/videos";
import type { JobStatus } from "../types/video";

const TERMINAL_STAGES = new Set(["done", "failed"]);

export function useVideoStatus(videoId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(videoStatusStreamUrl(videoId));

    source.onmessage = (event) => {
      const data: JobStatus = JSON.parse(event.data);
      queryClient.setQueryData<JobStatus>(["videoStatus", videoId], data);
      if (TERMINAL_STAGES.has(data.current_stage)) {
        // The server intentionally ends the stream here -- close on our side too,
        // otherwise EventSource's default behavior is to try reconnecting.
        source.close();
      }
    };

    // Deliberately no source.close() here: EventSource retries automatically on
    // transient errors (network blips, brief server restarts) with its own
    // backoff. Closing on error would silence that built-in recovery and leave
    // the UI stuck on stale status forever instead of reconnecting.

    return () => source.close();
  }, [videoId, queryClient]);

  return useQuery<JobStatus>({
    queryKey: ["videoStatus", videoId],
    queryFn: () => getVideoStatus(videoId),
    staleTime: Infinity,
  });
}
