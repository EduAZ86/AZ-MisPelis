import { AppError, toAppError } from "@core/errors";
import { voeDecode } from "./decoders/voe-decode";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Voe HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function resolveVoe(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    let html = await fetchHtml(url, { "User-Agent": UA, Referer: url, Accept: "text/html,*/*;q=0.8" });

    if (/permanentToken/i.test(html)) {
      const redirect = /window\.location\.href\s*=\s*'([^']+)'/i.exec(html)?.[1];
      if (redirect) {
        const res = await fetch(redirect, { headers: { "User-Agent": UA, Referer: url, Accept: "text/html,*/*;q=0.8" }, redirect: "follow" });
        if (res.ok) html = await res.text();
      }
    }

    const pair = /json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i.exec(html);
    if (!pair) return null;

    const [, encoded, loaderSrc] = pair;
    const loaderUrl = loaderSrc.startsWith("http") ? loaderSrc : new URL(loaderSrc, url).href;

    const loaderRes = await fetch(loaderUrl, { headers: { "User-Agent": UA, Referer: url, Accept: "*/*" }, redirect: "follow" });
    if (!loaderRes.ok) return null;
    const loaderText = await loaderRes.text();

    const arr = /(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i.exec(loaderText) ?? /(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i.exec(loaderText);
    if (!arr) return null;

    const words = arr[1]
      .replace(/[\[\]'"\s]/g, "")
      .split(",")
      .filter(Boolean);

    const decoded = voeDecode(encoded, words);
    if (!decoded) return null;

    return {
      url: decoded.url,
      quality: qualityFromUrl(decoded.url),
      headers: { ...decoded.headers, Referer: url, Origin: new URL(url).origin },
    };
  } catch {
    return null;
  }
}