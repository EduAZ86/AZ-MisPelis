import { AppError, toAppError } from "@core/errors";
import { unpackPacked, grabHls } from "./decoders/packed-js";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Filemoon HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

function absolute(target: string, baseUrl: string): string {
  if (!target.startsWith("/")) return target;
  const origin = /^(https?:\/\/[^/]+)/.exec(baseUrl)?.[1];
  return origin ? origin + target : target;
}

export function extractFilemoonStream(html: string, baseUrl: string): string | null {
  const unpacked = unpackPacked(html);
  const text = unpacked && unpacked !== html ? unpacked : html;

  const fromSources = /sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/i.exec(text)?.[1];
  if (fromSources) return absolute(fromSources, baseUrl);

  const direct = /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i.exec(text)?.[1];
  return grabHls(text, baseUrl) ?? direct ?? null;
}

export async function resolveFilemoon(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const origin = new URL(url).origin;
    const baseHeaders = {
      "User-Agent": UA,
      Referer: url,
      Origin: origin,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    let html = await fetchHtml(url, baseHeaders);
    let baseUrl = url;

    const iframe = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(html)?.[1];
    if (iframe) {
      baseUrl = iframe.startsWith("http") ? iframe : new URL(iframe, url).href;
      html = await fetchHtml(baseUrl, { ...baseHeaders, Referer: url });
    }

    const target = extractFilemoonStream(html, baseUrl);
    if (!target) return null;

    return {
      url: target,
      quality: qualityFromUrl(target),
      headers: { "User-Agent": UA, Referer: baseUrl, Origin: new URL(baseUrl).origin },
    };
  } catch {
    return null;
  }
}
