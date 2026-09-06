import { resolveGoodstream } from "./goodstream";
import { resolveVimeos } from "./vimeos";
import { resolveVoe } from "./voe";
import { resolveStreamwish } from "./streamwish";
import { resolveFastream } from "./fastream";

export interface ResolvedMirror {
  url: string;
  headers: Record<string, string>;
  quality: string;
}

const resolvers: Record<string, (url: string) => Promise<ResolvedMirror | null>> = {
  goodstream: resolveGoodstream,
  vimeos: resolveVimeos,
  voe: resolveVoe,
  streamwish: resolveStreamwish,
  "fastream.to": resolveFastream,
};

export function resolverFor(url: string): ((url: string) => Promise<ResolvedMirror | null>) | null {
  for (const [host, fn] of Object.entries(resolvers)) {
    if (url.includes(host)) return fn;
  }
  if (url.includes("volces") || url.includes("hlswish") || url.includes("streamwish") || url.includes("vibuxer")) {
    return resolvers.streamwish;
  }
  if (url.includes("fastream")) {
    return resolvers["fastream.to"];
  }
  return null;
}

export function mirrorName(url: string): string {
  if (url.includes("goodstream")) return "GoodStream";
  if (url.includes("vimeos")) return "Vimeos";
  if (url.includes("voe") || url.includes("cloudwindow") || url.includes("vidhide")) return "VOE";
  if (url.includes("streamwish") || url.includes("hlswish") || url.includes("vibuxer")) return "StreamWish";
  if (url.includes("fastream")) return "Fastream";
  if (url.includes("filemoon")) return "Filemoon";
  return "Online";
}