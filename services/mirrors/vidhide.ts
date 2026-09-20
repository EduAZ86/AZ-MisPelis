import { AppError, toAppError } from "@core/errors";
import { unpackPacked, grabHls } from "./decoders/packed-js";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function toEmbedUrl(url: string): string {
  return url
    .replace("/download/", "/v/")
    .replace("/file/", "/v/")
    .replace("/f/", "/v/")
    .replace("/d/", "/v/");
}

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `VidHide HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export function extractVidhideStream(html: string, baseUrl: string): string | null {
  const unpacked = unpackPacked(html);
  const text = unpacked && unpacked !== html ? unpacked : html;
  const direct = /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i.exec(text)?.[1] ?? null;
  return grabHls(text, baseUrl) ?? direct;
}

export async function resolveVidhide(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const embedUrl = toEmbedUrl(url);
    const origin = new URL(embedUrl).origin;

    const html = await fetchHtml(embedUrl, {
      "User-Agent": UA,
      Referer: `${origin}/`,
      Origin: origin,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    });

    const target = extractVidhideStream(html, embedUrl);
    if (!target) return null;

    return {
      url: target,
      quality: qualityFromUrl(target),
      headers: { "User-Agent": UA, Referer: embedUrl, Origin: origin },
    };
  } catch {
    return null;
  }
}
