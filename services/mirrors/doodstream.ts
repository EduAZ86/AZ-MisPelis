import { AppError, toAppError } from "@core/errors";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function toEmbedUrl(url: string): string {
  return url.replace("/d/", "/e/");
}

async function fetchWithRedirect(url: string, headers: Record<string, string>): Promise<{ html: string; finalUrl: string }> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) throw new AppError("NETWORK", `Doodstream HTTP ${res.status}`);
    const html = await res.text();
    return { html, finalUrl: res.url || url };
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export function extractDoodPassPath(html: string): string | null {
  const m = /\/pass_md5\/[^'"\s\\]+/.exec(html);
  return m ? m[0] : null;
}

export function doodRandomToken(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return out;
}

export function buildDoodDirectLink(prefix: string, passPath: string, random: string, expiry: number): string {
  const token = passPath.substring(passPath.lastIndexOf("/") + 1);
  return `${prefix}${random}?token=${token}&expiry=${expiry}`;
}

export async function resolveDoodstream(url: string): Promise<{ url: string; headers: Record<string, string>; quality: string } | null> {
  try {
    const embedUrl = toEmbedUrl(url);
    const { html, finalUrl } = await fetchWithRedirect(embedUrl, { "User-Agent": UA, Referer: url });

    const passPath = extractDoodPassPath(html);
    if (!passPath) return null;

    const origin = new URL(finalUrl).origin;
    const passRes = await fetch(`${origin}${passPath}`, {
      headers: { "User-Agent": UA, Referer: finalUrl, Range: "bytes=0-" },
      redirect: "follow",
    });
    if (!passRes.ok) return null;

    const prefix = (await passRes.text()).trim();
    if (!/^https?:\/\//.test(prefix)) return null;

    const direct = buildDoodDirectLink(prefix, passPath, doodRandomToken(), Date.now());
    return {
      url: direct,
      quality: "auto",
      headers: { "User-Agent": UA, Referer: `${origin}/` },
    };
  } catch {
    return null;
  }
}
