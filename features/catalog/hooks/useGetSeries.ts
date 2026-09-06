import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchTrending,
  fetchPopularTV,
  fetchTopRatedTV,
} from "@services/tmdb";
import { queryKeys, type CatalogSection } from "./queryKeys";

type SeriesCriterion = "trending" | "tv-popular" | "tv-top";

interface FetchSeriesParams {
  criterion: SeriesCriterion;
  page: number;
}

async function fetchSeries({ criterion, page }: FetchSeriesParams) {
  switch (criterion) {
    case "trending":
      return fetchTrending(page);
    case "tv-popular":
      return fetchPopularTV(page);
    case "tv-top":
      return fetchTopRatedTV(page);
  }
}

export function useGetSeries(criterion: SeriesCriterion = "tv-popular") {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.section(criterion, 1),
    queryFn: ({ pageParam = 1 }) => fetchSeries({ criterion, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.results.length < 20) return undefined;
      return (lastPage.page ?? 1) + 1;
    },
    select: (data) => ({
      pages: data.pages.map((p) => p.results),
      pageParams: data.pageParams,
    }),
  });
}

export function useGetSeriesSection(section: CatalogSection) {
  const isSeriesSection = section.startsWith("tv-") || section === "trending";
  const criterion: SeriesCriterion = section === "trending"
    ? "trending"
    : section === "tv-popular"
    ? "tv-popular"
    : "tv-top";

  return useGetSeries(isSeriesSection ? criterion : "tv-popular");
}