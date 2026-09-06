import { getLatinoSources } from "@services/hackstore";
import { getSeriesMetroSources } from "@services/seriesmetro";
import { getCached, setCache, withDedupe, keyOf } from "./cache";
import { AppError } from "@core/errors";
import type { StreamInput, StreamSource } from "@core/types";

async function fetchAllSources(input: StreamInput): Promise<StreamSource[]> {
  const [hackstoreSources, seriesmetroSources] = await Promise.allSettled([
    getLatinoSources(input),
    getSeriesMetroSources(input),
  ]);

  const results: StreamSource[] = [];

  if (hackstoreSources.status === "fulfilled") {
    results.push(...hackstoreSources.value);
  }

  if (seriesmetroSources.status === "fulfilled") {
    results.push(...seriesmetroSources.value);
  }

  return results;
}

export async function resolveStreams(input: StreamInput): Promise<StreamSource[]> {
  const key = keyOf(input);

  const cached = await getCached(key);
  if (cached) return cached;

  const sources = await withDedupe(key, () => fetchAllSources(input));

  const prioritized = prioritizeSources(sources);
  if (!prioritized.length) {
    throw new AppError("SOURCE_NOT_FOUND", `No se encontraron fuentes para ${input.type}:${input.id}`);
  }
  setCache(key, prioritized);
  return prioritized;
}

function prioritizeSources(sources: StreamSource[]): StreamSource[] {
  const langOrder: Record<string, number> = { Latino: 0, Español: 1, Castellano: 1, Subtitulado: 2, Inglés: 3 };
  const qualityOrder = (q: string) => (q === "1080p" ? 0 : q === "720p" ? 1 : 2);

  return [...sources].sort((a, b) => {
    const langDiff = (langOrder[a.language] ?? 4) - (langOrder[b.language] ?? 4);
    if (langDiff !== 0) return langDiff;
    return qualityOrder(a.quality) - qualityOrder(b.quality);
  });
}

export async function pickBestSource(input: StreamInput, preferredKey?: string): Promise<StreamSource | undefined> {
  const sources = await resolveStreams(input);
  if (preferredKey) {
    const explicit = sources.find((s) => s.key === preferredKey);
    if (explicit) return explicit;
  }
  return sources[0];
}