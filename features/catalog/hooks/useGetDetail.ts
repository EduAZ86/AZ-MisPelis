import { useQuery } from "@tanstack/react-query";
import { fetchDetail } from "@services/tmdb";
import { queryKeys } from "./queryKeys";
import type { TmdbDetail } from "@core/types";

export function useGetDetail(type: "movie" | "tv", id: number) {
  return useQuery({
    queryKey: queryKeys.detail.item(type, id),
    queryFn: () => fetchDetail(type, id),
    enabled: !!id,
    select: (data) => data as TmdbDetail,
  });
}