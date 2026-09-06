import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchTrending,
  fetchPopularMovies,
  fetchTopRatedMovies,
} from "@services/tmdb";
import { queryKeys, type CatalogSection } from "./queryKeys";
import type { TmdbMedia } from "@core/types";

type MovieCriterion = "trending" | "movie-popular" | "movie-top";

interface FetchMovieParams {
  criterion: MovieCriterion;
  page: number;
}

async function fetchMovies({ criterion, page }: FetchMovieParams) {
  switch (criterion) {
    case "trending":
      return fetchTrending(page);
    case "movie-popular":
      return fetchPopularMovies(page);
    case "movie-top":
      return fetchTopRatedMovies(page);
  }
}

export function useGetMovies(criterion: MovieCriterion = "movie-popular") {
  return useInfiniteQuery({
    queryKey: queryKeys.catalog.section(criterion, 1),
    queryFn: ({ pageParam = 1 }) =>
      fetchMovies({ criterion, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.results.length < 20) return undefined;
      return (lastPage.page ?? 1) + 1;
    },
    select: (data) => ({
      pages: data.pages.map((p) => p.results.map((r) => ({ ...r, media_type: r.media_type ?? "movie" }))),
      pageParams: data.pageParams,
    }),
  });
}

export { useGetMovies as useGetMovie };

export function useGetMovieSection(section: CatalogSection) {
  const isMovieSection = section.startsWith("movie-") || section === "trending";
  const criterion: MovieCriterion =
    section === "trending"
      ? "trending"
      : section === "movie-popular"
        ? "movie-popular"
        : "movie-top";

  return useGetMovies(isMovieSection ? criterion : "movie-popular");
}
