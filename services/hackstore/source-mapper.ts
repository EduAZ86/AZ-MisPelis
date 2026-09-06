import { resolverFor, mirrorName } from "@services/mirrors";

const LANGS: Record<string, string> = {
  LAT: "Latino",
  LATINO: "Latino",
  ESP: "Español",
  CASTELLANO: "Español",
  ES: "Español",
  VOSE: "Subtitulado",
  SUB: "Subtitulado",
  SUBTITULADO: "Subtitulado",
  ENG: "Inglés",
  EN: "Inglés",
};

export interface LatinoSource {
  key: string;
  url: string;
  headers: Record<string, string>;
  provider: "hackstore" | "seriesmetro";
  mirror: string;
  language: "Latino" | "Español" | "Subtitulado" | "Inglés";
  quality: string;
}

function langLabel(raw: string | undefined): string {
  const s = (raw || "LAT").toUpperCase().trim();
  return LANGS[s] ?? s;
}

export async function mapEmbedToSource(embedUrl: string, embedLang?: string): Promise<LatinoSource | null> {
  const resolver = resolverFor(embedUrl);
  if (!resolver) return null;

  const resolved = await resolver(embedUrl);
  if (!resolved?.url) return null;

  return {
    key: embedUrl,
    url: resolved.url,
    headers: resolved.headers,
    provider: "hackstore",
    mirror: mirrorName(embedUrl),
    language: langLabel(embedLang) as LatinoSource["language"],
    quality: resolved.quality || "auto",
  };
}