const BASE = "https://backend.metacritic.com/finder/metacritic/search";
const API_KEY = "1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u";

export interface MetaSearchItem {
  title: string;
  slug: string;
  type: string;
  premiereYear?: number;
  criticScoreSummary?: { score?: number };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function metaType(type: "movie" | "tv"): number {
  return type === "tv" ? 1 : 2;
}

/**
 * Elige el metascore SOLO cuando hay un match exacto de título (normalizado).
 * Si el año coincide, lo devuelve de inmediato. Sin match exacto → undefined
 * (evita devolver el score de un resultado fuzzy con puntaje inflado).
 */
export function pickBestScore(
  items: MetaSearchItem[],
  query: string,
  year?: number
): number | undefined {
  const q = normalize(query);
  if (!q || !items.length) return undefined;

  const exact = items.filter((item) => normalize(item.title) === q);
  if (!exact.length) return undefined;

  if (year != null) {
    const byYear = exact.find((item) => item.premiereYear === year);
    if (byYear) return byYear.criticScoreSummary?.score;
  }

  return exact[0].criticScoreSummary?.score;
}

export async function searchMetaScore(
  query: string,
  type: "movie" | "tv",
  year?: number
): Promise<number | undefined> {
  const url =
    `${BASE}/${encodeURIComponent(query)}/web` +
    `?offset=0&limit=10&sortBy=META_SCORE&sortDirection=DESC` +
    `&mcoTypeId=${metaType(type)}&componentName=search&componentType=SearchResult` +
    `&apiKey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) return undefined;

  const json = (await res.json()) as { data?: { items?: MetaSearchItem[] } };
  const items = json?.data?.items;
  if (!items?.length) return undefined;

  return pickBestScore(items, query, year);
}
