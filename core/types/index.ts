export interface StreamInput {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
}

export type LatinoSourceLanguage = "Latino" | "Español" | "Subtitulado" | "Inglés";

export interface LatinoSource {
  key: string;
  url: string;
  headers: Record<string, string>;
  provider: "hackstore" | "seriesmetro";
  mirror: string;
  language: LatinoSourceLanguage;
  quality: string;
}

export interface StreamSource {
  key: string;
  url: string;
  headers: Record<string, string>;
  provider: "streamguide" | "hackstore" | "seriesmetro";
  mirror: string;
  language: LatinoSourceLanguage;
  quality: string;
}

export interface TmdbMedia {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type: "movie" | "tv";
}

export interface TmdbDetail extends TmdbMedia {
  genres: { id: number; name: string }[];
  seasons?: { season_number: number; episode_count: number }[];
  credits?: { cast: TmdbCast[] };
  videos?: { results: TmdbVideo[] };
}

export interface TmdbCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface TmdbSeasonEpisodes {
  episodes: TmdbEpisode[];
}

export interface TmdbTitles {
  esEs: string;
  esMx: string;
  enUs: string;
  original: string;
}

export interface ContinueWatchingItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster: string;
  progress: number;
  duration: number;
  updatedAt: number;
  season?: number;
  episode?: number;
  addedAt: number;
}