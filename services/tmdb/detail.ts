import { tmdbFetch } from "./client";
import type { TmdbDetail, TmdbTitles } from "@core/types";

export async function fetchDetail(type: "movie" | "tv", id: number): Promise<TmdbDetail> {
  const path = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
  return tmdbFetch<TmdbDetail>(path, { append_to_response: "credits,videos" });
}

async function fetchTitle(id: number, type: "movie" | "tv", lang: string): Promise<string> {
  try {
    const path = type === "movie" ? `/movie/${id}` : `/tv/${id}`;
    const data = await tmdbFetch<{ title?: string; name?: string }>(path, { language: lang });
    return type === "movie" ? (data.title ?? "") : (data.name ?? "");
  } catch {
    return "";
  }
}

export async function fetchTmdbTitles(type: "movie" | "tv", id: number): Promise<TmdbTitles> {
  const [esES, esMX, enUS, original] = await Promise.allSettled([
    fetchTitle(id, type, "es-ES"),
    fetchTitle(id, type, "es-MX"),
    fetchTitle(id, type, "en-US"),
    fetchTitle(id, type, "en-US"),
  ]);

  const getTitle = (r: PromiseSettledResult<string>) => (r.status === "fulfilled" ? r.value : "");

  const isLatino = (title: string): boolean => {
    return !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(title);
  };

  const esEsTitle = getTitle(esES);
  const esMxTitle = getTitle(esMX);
  const enUsTitle = getTitle(enUS);
  const originalTitle = getTitle(original);

  return {
    esEs: esEsTitle,
    esMx: isLatino(esMxTitle) ? esMxTitle : "",
    enUs: enUsTitle,
    original: originalTitle,
  };
}

export function getDisplayTitle(detail: TmdbDetail, type: "movie" | "tv"): string {
  return type === "movie" ? (detail.title ?? "") : (detail.name ?? "");
}

export function getYear(detail: TmdbDetail, type: "movie" | "tv"): string {
  const date = type === "movie" ? detail.release_date : detail.first_air_date;
  return date ? date.slice(0, 4) : "";
}