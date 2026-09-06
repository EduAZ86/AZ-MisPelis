import { useQuery } from "@tanstack/react-query";
import { fetchSeasonEpisodes } from "@services/tmdb";
import { queryKeys } from "./queryKeys";
import type { TmdbEpisode } from "@core/types";

export function useGetSeason(tvId: number, season: number) {
  return useQuery({
    queryKey: [...queryKeys.detail.item("tv", tvId), "season", season],
    queryFn: () => fetchSeasonEpisodes(tvId, season),
    enabled: !!tvId && !!season,
    select: (data) => data.episodes as TmdbEpisode[],
  });
}