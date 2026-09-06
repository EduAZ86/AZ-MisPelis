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

export interface ServerSpan {
  id: string;
  label: string;
}

export function extractServerSpans(html: string): ServerSpan[] {
  const regex = /href="#options-(\d+)"[^>]*>[\s\S]*?<span class="server">([\s\S]*?)<\/span>/g;
  const spans: ServerSpan[] = [];
  for (const m of html.matchAll(regex)) {
    spans.push({ id: m[1], label: m[2].replace(/<[^>]+>/g, "").trim() });
  }
  return spans;
}

export function extractTrembedParams(html: string): { trembed: string; trid: string; trtype: string } | null {
  const regex = /\?trembed=(\d+)(?:&#038;|&)trid=(\d+)(?:&#038;|&)trtype=(\d+)/g;
  for (const m of html.matchAll(regex)) {
    return { trembed: m[1], trid: m[2], trtype: m[3] };
  }
  return null;
}

const PREFERENCE = ["latino", "lat", "castellano", "espanol", "esp", "vose", "sub", "subtitulado"];
const ORDER = new Map(PREFERENCE.map((k, i) => [k, i]));

export function sortSpansByLanguage(spans: ServerSpan[]): ServerSpan[] {
  return [...spans].sort((a, b) => {
    const ka = ORDER.get(a.label.split("-").pop()?.trim().toLowerCase() ?? "") ?? 99;
    const kb = ORDER.get(b.label.split("-").pop()?.trim().toLowerCase() ?? "") ?? 99;
    return ka - kb;
  });
}

export async function resolveServerSpan(
  baseUrl: string,
  trembed: string,
  trid: string,
  trtype: string,
  span: ServerSpan,
  referer: string
): Promise<LatinoSource | null> {
  try {
    const url = `${baseUrl}/?trembed=${span.id}&trid=${trid}&trtype=${trtype}`;
    const res = await fetch(url, { headers: { Referer: referer } });
    if (!res.ok) return null;
    const html = await res.text();

    const iframeMatch = /<iframe[^>]*src="(https?:\/\/fastream\.to\/[^"]+)"/i.exec(html);
    if (!iframeMatch) return null;

    const iframeUrl = iframeMatch[1];
    const resolver = resolverFor(iframeUrl);
    if (!resolver) return null;

    const resolved = await resolver(iframeUrl);
    if (!resolved?.url) return null;

    return {
      key: iframeUrl,
      url: resolved.url,
      headers: resolved.headers,
      provider: "seriesmetro",
      mirror: mirrorName(iframeUrl),
      language: langLabel(span.label.split("-").pop()?.trim() ?? "") as LatinoSource["language"],
      quality: resolved.quality || "auto",
    };
  } catch {
    return null;
  }
}