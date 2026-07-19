import { useQuery } from "@tanstack/react-query";
import { getVideoNotes } from "@/api/videos";
import { toNoteSections } from "@/lib/mapVideoData";

export function useVideoNotes(videoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["videoNotes", videoId],
    queryFn: async () => toNoteSections(await getVideoNotes(videoId)),
    enabled,
  });
}
