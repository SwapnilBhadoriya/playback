import { useQuery } from "@tanstack/react-query";
import { getVideoMetadata } from "@/api/videos";
import { toVideoMetadata } from "@/lib/mapVideoData";

export function useVideoMetadata(videoId: string) {
  return useQuery({
    queryKey: ["videoMetadata", videoId],
    queryFn: async () => toVideoMetadata(await getVideoMetadata(videoId)),
    retry: false,
  });
}
