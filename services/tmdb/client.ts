import { AppError } from "@core/errors";
import type { TmdbMedia, TmdbDetail, TmdbCast } from "@core/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

let tokenCache: string | null = null;

export async function getTmdbToken(): Promise<string> {
  if (tokenCache) return tokenCache;

  const envToken = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;
  if (!envToken) {
    throw new AppError("UNAUTHORIZED", "TMDB token not configured");
  }
  const token = envToken;
  tokenCache = token;
  return token;
}

export async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = await getTmdbToken();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", "es-MX");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new AppError("UNAUTHORIZED", "TMDB token invalid");
    if (res.status === 429) throw new AppError("RATE_LIMITED", "TMDB rate limit");
    throw new AppError("NETWORK", `TMDB HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchTrending(page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/trending/all/week", { page: String(page) });
}

export async function fetchPopularMovies(page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/movie/popular", { page: String(page) });
}

export async function fetchPopularTV(page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/tv/popular", { page: String(page) });
}

export async function fetchTopRatedMovies(page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/movie/top_rated", { page: String(page) });
}

export async function fetchTopRatedTV(page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/tv/top_rated", { page: String(page) });
}

export async function searchTMDB(query: string, page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  return tmdbFetch("/search/multi", { query, page: String(page), include_adult: "false" });
}

export async function fetchMovieDetail(id: number): Promise<TmdbDetail> {
  return tmdbFetch(`/movie/${id}`, { append_to_response: "credits,videos" });
}

export async function fetchTVDetail(id: number): Promise<TmdbDetail> {
  return tmdbFetch(`/tv/${id}`, { append_to_response: "credits,videos" });
}

export async function fetchMovieCredits(id: number): Promise<{ cast: TmdbCast[] }> {
  return tmdbFetch(`/movie/${id}/credits`);
}

export async function fetchTVCredits(id: number): Promise<{ cast: TmdbCast[] }> {
  return tmdbFetch(`/tv/${id}/credits`);
}

export function getImageUrl(path: string | null, size: "w200" | "w300" | "w342" | "w500" | "w780" | "original" = "w342"): string {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function fetchTmdbInfo(type: "movie" | "tv", id: number): Promise<{ title: string; original: string; year: string }> {
  const path = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const data = await tmdbFetch<{ title?: string; name?: string; original_title?: string; original_name?: string; release_date?: string; first_air_date?: string }>(path);
  return {
    title: type === "movie" ? data.title ?? "" : data.name ?? "",
    original: type === "movie" ? data.original_title ?? "" : data.original_name ?? "",
    year: (type === "movie" ? data.release_date : data.first_air_date ?? "")?.slice(0, 4) ?? "",
  };
}

export type { TmdbMedia, TmdbDetail, TmdbCast, TmdbVideo, TmdbTitles } from "@core/types";