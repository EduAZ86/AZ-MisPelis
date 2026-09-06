import { toAppError } from "@core/errors";
import { unpackPacked, grabHls } from "./decoders/packed-js";
import { detectQuality } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new Error(`Fastream HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function resolveFastream(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const html = await fetchHtml(url, {
      "User-Agent": UA,
      Referer: "https://www3.seriesmetro.net/",
    });
    const unpacked = unpackPacked(html);
    const target =
      (unpacked && (grabHls(unpacked) ?? /file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/.exec(unpacked)?.[1] ?? null)) ||
      /file:"(https?:\/\/[^"]+\.m3u8[^"]*)"/.exec(html)?.[1] ||
      null;
    if (!target) return null;
    const quality = await detectQuality(target, { Referer: "https://fastream.to/", "User-Agent": UA });
    return {
      url: target,
      quality,
      headers: { "User-Agent": UA, Referer: "https://fastream.to/" },
    };
  } catch {
    return null;
  }
}