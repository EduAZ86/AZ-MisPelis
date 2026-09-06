import { base64Decode } from "@core/base64";

export function voeDecode(encoded: string, wordArray: string[]): { url: string; headers: Record<string, string> } | null {
  try {
    const words = wordArray.map((w) => w.replace(/^'+|'+$/g, ""));

    const base = base64Decode(encoded);
    if (!base) return null;

    let result = "";
    for (let i = 0; i < base.length; i++) {
      const charCode = base.charCodeAt(i);
      const wordIdx = i % words.length;
      const wordCharCode = words[wordIdx].charCodeAt(0);
      result += String.fromCharCode(charCode ^ wordCharCode);
    }

    const m = /["']([^"']+\.m3u8[^"']*)['"]/i.exec(result);
    if (!m) return null;

    return {
      url: m[1],
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    };
  } catch {
    return null;
  }
}