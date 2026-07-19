import { useQuery } from "@tanstack/react-query";
import { getVideoStatus } from "../api/videos";
import type { JobStatus } from "../types/video";

const POLL_INTERVAL_MS = 2000;

export function useVideoStatus(videoId: string) {
  return useQuery<JobStatus>({
    queryKey: ["videoStatus", videoId],
    queryFn: () => getVideoStatus(videoId),
    refetchInterval: (query) => {
      const stage = query.state.data?.current_stage;
      return stage === "done" || stage === "failed" ? false : POLL_INTERVAL_MS;
    },
  });
}
