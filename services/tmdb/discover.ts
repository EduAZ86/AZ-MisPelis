import { tmdbFetch } from "./client";
import type { TmdbGenre, TmdbMedia, CatalogFilters } from "@core/types";

export interface CatalogPage {
  results: TmdbMedia[];
  page: number;
}

function normalize(results: TmdbMedia[], fallbackType: "movie" | "tv"): TmdbMedia[] {
  return results.map((r) => ({ ...r, media_type: r.media_type ?? fallbackType }));
}

function sortByFor(type: "movie" | "tv", filters: CatalogFilters): string {
  const { sortBy } = filters;
  if (type === "tv" && (sortBy === "revenue.desc" || sortBy === "release_date.desc")) {
    return "first_air_date.desc";
  }
  if (type === "movie" && sortBy === "first_air_date.desc") {
    return "release_date.desc";
  }
  return sortBy;
}

export async function fetchMovieGenres(): Promise<{ genres: TmdbGenre[] }> {
  return tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list", { language: "es-MX" });
}

export async function fetchTVGenres(): Promise<{ genres: TmdbGenre[] }> {
  return tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list", { language: "es-MX" });
}

export async function fetchDiscoverMovies(
  filters: CatalogFilters,
  page = 1
): Promise<CatalogPage> {
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortByFor("movie", filters),
    include_adult: "false",
    "vote_count.gte": filters.sortBy === "vote_average.desc" ? "300" : "50",
  };
  if (filters.genre) params.with_genres = String(filters.genre);
  if (filters.year) params.primary_release_year = String(filters.year);

  const data = await tmdbFetch<{ results: TmdbMedia[]; page: number }>("/discover/movie", params);
  return { results: normalize(data.results, "movie"), page: data.page };
}

export async function fetchDiscoverTV(
  filters: CatalogFilters,
  page = 1
): Promise<CatalogPage> {
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortByFor("tv", filters),
    include_adult: "false",
    "vote_count.gte": filters.sortBy === "vote_average.desc" ? "300" : "50",
  };
  if (filters.genre) params.with_genres = String(filters.genre);
  if (filters.year) params.first_air_date_year = String(filters.year);

  const data = await tmdbFetch<{ results: TmdbMedia[]; page: number }>("/discover/tv", params);
  return { results: normalize(data.results, "tv"), page: data.page };
}