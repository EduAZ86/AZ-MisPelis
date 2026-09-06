import { fetchSingle, fetchPlayer } from "./api";
import { buildPostName } from "./slug";
import { mapEmbedToSource } from "./source-mapper";
import { fetchTmdbInfo } from "@services/tmdb";
import type { StreamInput } from "@core/types";
import type { LatinoSource } from "./source-mapper";
import { keyOf } from "@services/streams/cache";

const TTL = 3 * 60 * 60 * 1000;
const cache = new Map<string, { value: LatinoSource[]; at: number }>();

const PREF: Record<string, number> = { Latino: 0, Español: 1, Castellano: 1, Subtitulado: 2, Inglés: 3 };

async function hackstoreSources(input: StreamInput): Promise<LatinoSource[]> {
  const info = await fetchTmdbInfo(input.type, input.id);
  const postName = buildPostName(input.type, info.title, info.year, input.season, input.episode);
  const postType = input.type === "movie" ? "movies" : "episodes";

  const single = await fetchSingle(postName, postType);
  const postId = input.type === "tv" ? single.data?.episode?._id : single.data?._id;
  if (!postId) return [];

  const player = await fetchPlayer(postId);
  const embeds = player.data ?? [];

  const results = await Promise.allSettled(
    embeds.map(async (e) => {
      if (!e?.url) return null;
      const resolved = await mapEmbedToSource(e.url, e.lang);
      return resolved;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<LatinoSource> => r.status === "fulfilled" && !!r.value)
    .map((r) => r.value);
}

export async function getLatinoSources(input: StreamInput): Promise<LatinoSource[]> {
  const key = `hackstore:${keyOf(input)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) return cached.value;

  const sources = await hackstoreSources(input);
  if (sources.length) cache.set(key, { value: sources, at: Date.now() });
  return sources;
}

export function pickLatinoSource(
  sources: LatinoSource[],
  sourceKey?: string
): LatinoSource | undefined {
  const explicit = sourceKey ? sources.find((s) => s.key === sourceKey) : undefined;
  if (explicit) return explicit;
  return [...sources].sort(
    (a, b) =>
      (PREF[a.language] ?? 4) - (PREF[b.language] ?? 4) ||
      (a.quality === "1080p" ? 0 : a.quality === "720p" ? 1 : 2) -
        (b.quality === "1080p" ? 0 : b.quality === "720p" ? 1 : 2)
  )[0];
}

export * from "./api";
export * from "./slug";
export * from "./source-mapper";