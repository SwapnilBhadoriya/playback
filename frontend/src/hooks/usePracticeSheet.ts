import { useQuery } from "@tanstack/react-query";
import { getPracticeSheet } from "@/api/videos";
import { toPracticeQuestions } from "@/lib/mapVideoData";

export function usePracticeSheet(videoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["practiceSheet", videoId],
    queryFn: async () => toPracticeQuestions(await getPracticeSheet(videoId)),
    enabled,
  });
}
