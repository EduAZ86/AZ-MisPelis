import { AppError, toAppError } from "@core/errors";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Goodstream HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function resolveGoodstream(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const html = await fetchHtml(url, {
      "User-Agent": UA,
      Referer: "https://goodstream.one",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    });
    const m = /file:\s*"([^"]+)"/.exec(html);
    if (!m) return null;
    const target = m[1];
    return {
      url: target,
      quality: qualityFromUrl(target),
      headers: { Referer: url, Origin: "https://goodstream.one", "User-Agent": UA },
    };
  } catch {
    return null;
  }
}