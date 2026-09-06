import { qualityFromUrl } from "@services/streams/quality";
import { keyOf } from "@services/streams/cache";
import { toAppError } from "@core/errors";
import type { StreamInput, StreamSource, LatinoSourceLanguage } from "@core/types";

const BASE = "https://streamguide.cfd/Perses";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const PLAYBACK_HEADERS = {
  "User-Agent": UA,
  Referer: "https://vidcore.org/",
};

const TTL = 3 * 60 * 60 * 1000;
const cache = new Map<string, { value: StreamSource[]; at: number }>();
const inFlight = new Map<string, Promise<StreamSource[]>>();

interface PersesSource {
  url?: string;
  type?: string;
  language?: string;
}

interface PersesProvider {
  name?: string;
  sources?: PersesSource[];
}

interface PersesResponse {
  providers?: PersesProvider[];
}

function listUrl(input: StreamInput): string {
  const q = "?verify=true";
  return input.type === "movie"
    ? `${BASE}/movie/${input.id}${q}`
    : `${BASE}/tv/${input.id}/${input.season ?? 1}/${input.episode ?? 1}${q}`;
}

function normalizeLanguage(lang: string | undefined): LatinoSourceLanguage {
  const s = (lang ?? "").toLowerCase();
  if (/(latino|es-419|hispano|es_mx|latam)/.test(s)) return "Latino";
  if (/(español|spanish|espagnol|castellano|^es\b|_es\b|spa)/.test(s)) return "Español";
  if (/(ingl?s|english|^en\b|\beng\b)/.test(s)) return "Inglés";
  return "Subtitulado";
}

function mirrorName(provider: string | undefined, url: string): string {
  const name = (provider ?? "").toLowerCase();
  if (!name || name === "servidor") {
    if (url.includes("vidcore")) return "Vidcore";
    if (url.includes("goodstream")) return "GoodStream";
    if (url.includes("streamwish") || url.includes("hlswish")) return "StreamWish";
    if (url.includes("voe")) return "VOE";
    if (url.includes("vimeos")) return "Vimeos";
    if (url.includes("fastream")) return "Fastream";
    return "Online";
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function toStreamSource(provider: string | undefined, s: PersesSource, index: number): StreamSource | null {
  if (!s.url || !/^https?:\/\//.test(s.url)) return null;
  return {
    key: `streamguide:${provider ?? "online"}:${index}:${s.url}`,
    url: s.url,
    headers: PLAYBACK_HEADERS,
    provider: "streamguide",
    mirror: mirrorName(provider, s.url),
    language: normalizeLanguage(s.language),
    quality: qualityFromUrl(s.url),
  };
}

export async function getStreamGuideSources(input: StreamInput): Promise<StreamSource[]> {
  const key = `streamguide:${keyOf(input)}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) return cached.value;

  const pending = inFlight.get(key) ?? (async () => {
    const res = await fetch(listUrl(input), {
      headers: {
        "user-agent": UA,
        referer: "https://vidcore.org/",
      },
    });
    if (!res.ok) throw toAppError(new Error(`StreamGuide HTTP ${res.status}`), "NETWORK");
    const data = (await res.json().catch(() => null)) as PersesResponse | null;
    const sources = (data?.providers ?? [])
      .flatMap((p, pIndex) =>
        (p.sources ?? []).map((s, sIndex) => toStreamSource(p.name ?? "servidor", s, pIndex * 100 + sIndex))
      )
      .filter((s): s is StreamSource => !!s);
    cache.set(key, { value: sources, at: Date.now() });
    return sources;
  })();

  inFlight.set(key, pending);
  try {
    return await pending;
  } finally {
    inFlight.delete(key);
  }
}
