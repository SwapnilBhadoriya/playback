import { useQuery } from "@tanstack/react-query";
import { listVideos } from "@/api/videos";
import { toVideoMetadata } from "@/lib/mapVideoData";

export function useVideoLibrary() {
  return useQuery({
    queryKey: ["videoLibrary"],
    queryFn: async () => (await listVideos()).map(toVideoMetadata),
  });
}
