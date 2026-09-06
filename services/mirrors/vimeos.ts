import { AppError, toAppError } from "@core/errors";
import { unpackPacked, grabHls } from "./decoders/packed-js";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Vimeos HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function resolveVimeos(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const html = await fetchHtml(url, {
      "User-Agent": UA,
      Referer: "https://vimeos.net/",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    });
    const unpacked = unpackPacked(html);
    const target = unpacked ? grabHls(unpacked, url) : /["']([^"']+\.m3u8[^"']*)['"]/i.exec(html)?.[1] ?? null;
    if (!target) return null;
    return {
      url: target,
      quality: qualityFromUrl(target),
      headers: { "User-Agent": UA, Referer: "https://vimeos.net/" },
    };
  } catch {
    return null;
  }
}