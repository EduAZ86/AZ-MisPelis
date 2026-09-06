import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchMovieGenres,
  fetchTVGenres,
  fetchDiscoverMovies,
  fetchDiscoverTV,
} from "@services/tmdb";
import { queryKeys } from "./queryKeys";
import type { CatalogFilters, TmdbGenre, TmdbMedia } from "@core/types";

const GENRES_STALE_TIME = 1000 * 60 * 60 * 24 * 7;

export function useGetMovieGenres() {
  return useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () => fetchMovieGenres(),
    staleTime: GENRES_STALE_TIME,
    select: (data) => data.genres as TmdbGenre[],
  });
}

export function useGetSeriesGenres() {
  return useQuery({
    queryKey: ["genres", "tv"],
    queryFn: () => fetchTVGenres(),
    staleTime: GENRES_STALE_TIME,
    select: (data) => data.genres as TmdbGenre[],
  });
}

export function useDiscoverMovies(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.catalog.all, "discover", "movie", filters],
    queryFn: ({ pageParam = 1 }) => fetchDiscoverMovies(filters, pageParam as number),
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

export function useDiscoverSeries(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.catalog.all, "discover", "tv", filters],
    queryFn: ({ pageParam = 1 }) => fetchDiscoverTV(filters, pageParam as number),
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

export type { TmdbMedia };