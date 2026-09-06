import { useInfiniteQuery } from "@tanstack/react-query";
import { searchCatalog } from "@services/tmdb";
import { queryKeys } from "./queryKeys";
import type { TmdbMedia } from "@core/types";

export function useGetSearch(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.search.query(query, 1),
    queryFn: ({ pageParam = 1 }) => searchCatalog(query, pageParam as number),
    initialPageParam: 1,
    enabled: query.trim().length >= 2,
    getNextPageParam: (lastPage) => {
      if (lastPage.results.length < 20) return undefined;
      return (lastPage.page ?? 1) + 1;
    },
    select: (data) => ({
      pages: data.pages.map((p) =>
        p.results
          .filter((r) => r.media_type === "movie" || r.media_type === "tv")
          .map((r) => ({ ...r, media_type: r.media_type ?? "movie" }))
      ),
      pageParams: data.pageParams,
    }),
  });
}