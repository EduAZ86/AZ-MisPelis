import type { StreamInput } from "@core/types";

export type CatalogSection =
  | "trending"
  | "movie-popular"
  | "movie-top"
  | "tv-popular"
  | "tv-top";

export const queryKeys = {
  catalog: {
    all: ["catalog"] as const,
    section: (section: CatalogSection, page: number) =>
      [...queryKeys.catalog.all, section, page] as const,
    trending: (page: number) => queryKeys.catalog.section("trending", page),
    moviePopular: (page: number) => queryKeys.catalog.section("movie-popular", page),
    movieTop: (page: number) => queryKeys.catalog.section("movie-top", page),
    tvPopular: (page: number) => queryKeys.catalog.section("tv-popular", page),
    tvTop: (page: number) => queryKeys.catalog.section("tv-top", page),
  },
  search: {
    all: ["search"] as const,
    query: (query: string, page: number) =>
      [...queryKeys.search.all, query, page] as const,
  },
  detail: {
    all: ["detail"] as const,
    item: (type: "movie" | "tv", id: number) =>
      [...queryKeys.detail.all, type, id] as const,
  },
  servers: {
    all: ["servers"] as const,
    list: (input: StreamInput) =>
      [...queryKeys.servers.all, input.type, input.id, input.season ?? null, input.episode ?? null] as const,
  },
  bestSource: {
    all: ["bestSource"] as const,
    item: (sourceKey: string) => [...queryKeys.bestSource.all, sourceKey] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;