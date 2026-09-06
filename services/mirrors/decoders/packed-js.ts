export function unpackPacked(src: string): string {
  const patterns = [
    /eval\(function\(p,a,c,k,e,d\)\{.*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)\)\)/,
    /eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/,
    /eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',(\d+),(\d+),'([\s\S]+?)'\.split\('\|'\)/,
  ];
  for (const pat of patterns) {
    const m = pat.exec(src);
    if (!m) continue;
    try {
      let decoded = m[1];
      const base = parseInt(m[2]);
      const count = parseInt(m[3]);
      const dict = m[4].split("|");
      const dictBase = Math.max(base, 2);
      for (let i = count - 1; i >= 0; i--) {
        if (!dict[i]) continue;
        decoded = decoded.replace(new RegExp(`\\b${i.toString(dictBase)}\\b`, "g"), dict[i]);
      }
      return decoded;
    } catch {
      continue;
    }
  }
  return src;
}

export function grabHls(text: string, base?: string): string | null {
  const hlsObj = /\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/.exec(text);
  if (hlsObj) {
    const json = hlsObj[0].replace(/(\w+)\s*:/g, '"$1":');
    try {
      const parsed = JSON.parse(json) as Record<string, string>;
      const u = parsed.hls4 || parsed.hls3 || parsed.hls2;
      if (u) return u.startsWith("/") && base ? base + u : u;
    } catch {
      const m = /"hls[234]"\s*:\s*"([^"]+\.m3u8[^"]*)"/.exec(hlsObj[0]);
      if (m && m[1]) return m[1].startsWith("/") && base ? base + m[1] : m[1];
    }
  }
  const direct = /["']([^"']{30,}\.m3u8[^"']*)['"]/i.exec(text);
  if (direct) {
    const u = direct[1];
    return u.startsWith("/") && base ? base + u : u;
  }
  return null;
}

export function grabFile(url: string, text: string): string | null {
  const m = /file\s*:\s*["']([^"']+)["']/i.exec(text);
  if (!m) return null;
  let u = m[1];
  if (u.startsWith("/")) {
    const origin = /^(https?:\/\/[^/]+)/.exec(url)?.[1];
    if (origin) u = origin + u;
  }
  return u;
}