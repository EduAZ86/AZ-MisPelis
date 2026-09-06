const QUALITY_BY_URLSET: Record<string, Record<string, string>> = {
  vimeos: { h: "720p", n: "480p" },
  goodstream: { x: "1080p", h: "720p", n: "480p", l: "360p" },
  voe: { n: "720p", l: "360p" },
  streamwish: { x: "1080p", h: "1080p", n: "720p", l: "480p" },
};

const URLSET_ORDER = ["x", "o", "h", "n", "l"];

export function qualityFromUrl(url: string): string {
  if (!url) return "Unknown";
  const set = /_([a-z,]+),\.urlset/.exec(url)?.[1];
  if (set) {
    const hostKind = url.includes("vimeos")
      ? "vimeos"
      : url.includes("goodstream")
        ? "goodstream"
        : url.includes("cloudwindow")
          ? "voe"
          : url.includes("vidhide")
            ? "voe"
            : url.includes("streamwish") || url.includes("hlswish") || url.includes("vibuxer")
              ? "streamwish"
              : null;
    const table = hostKind ? QUALITY_BY_URLSET[hostKind] : null;
    if (table) {
      for (const code of URLSET_ORDER) {
        if (set.split(",").includes(code) && table[code]) return table[code];
      }
    }
  }
  const num = /[_\-\/](\d{3,4})p/.exec(url)?.[1];
  return num ? `${num}p` : "Unknown";
}

function resolutionLabel(w: number, h: number): string {
  if (w >= 3840 || h >= 2160) return "4K";
  if (w >= 1920 || h >= 1080) return "1080p";
  if (w >= 1280 || h >= 720) return "720p";
  if (w >= 854 || h >= 480) return "480p";
  return "360p";
}

export async function detectQuality(url: string, headers: Record<string, string>): Promise<string> {
  try {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (!res.ok) return qualityFromUrl(url);
    const html = await res.text();
    if (!html.includes("#EXT-X-STREAM-INF")) return qualityFromUrl(url);

    let maxH = 0;
    let maxW = 0;
    for (const line of html.split("\n")) {
      const m = /RESOLUTION=(\d+)x(\d+)/.exec(line);
      if (m) {
        const w = Number(m[2]);
        if (w > maxH) {
          maxH = w;
          maxW = Number(m[1]);
        }
      }
    }
    return maxH > 0 ? resolutionLabel(maxW, maxH) : "Unknown";
  } catch {
    return "Unknown";
  }
}