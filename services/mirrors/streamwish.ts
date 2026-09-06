import { AppError, toAppError } from "@core/errors";
import { qualityFromUrl } from "./decoders/quality";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchHtml(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Streamwish HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function resolveStreamwish(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const html = await fetchHtml(url, { "User-Agent": UA, Referer: url, Accept: "text/html,*/*;q=0.8" });

    const sourcesMatch = /sources\s*:\s*(\[[^\]]+\])/.exec(html);
    if (!sourcesMatch) return null;

    try {
      const sources = JSON.parse(sourcesMatch[1]) as { file: string; label?: string; type?: string }[];
      const hls = sources.find((s) => s.type === "application/x-mpegURL" || s.file.endsWith(".m3u8"));
      if (!hls) return null;

      return {
        url: hls.file,
        quality: hls.label ? qualityFromUrl(hls.file) : qualityFromUrl(hls.file),
        headers: { "User-Agent": UA, Referer: url, Origin: new URL(url).origin },
      };
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}