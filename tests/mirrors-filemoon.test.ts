import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractFilemoonStream, resolveFilemoon } from "@services/mirrors/filemoon";

const FIX = (p: string) => resolve(__dirname, "..", "__fixtures__", p);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("extractFilemoonStream", () => {
  const html = readFileSync(FIX("mirrors/filemoon-embed.html"), "utf8");

  it("desempaqueta y extrae sources[0].file", () => {
    expect(extractFilemoonStream(html, "https://filemoon.sx/e/xyz")).toBe(
      "https://cdn.filemoon.sx/hls/xyz/master.m3u8"
    );
  });

  it("resuelve file relativo con el origen base", () => {
    const plain = '<script>sources:[{file:"/hls/rel/master.m3u8"}]</script>';
    expect(extractFilemoonStream(plain, "https://filemoon.sx/e/xyz")).toBe(
      "https://filemoon.sx/hls/rel/master.m3u8"
    );
  });

  it("retorna null si no hay stream", () => {
    expect(extractFilemoonStream("<div>nada</div>", "https://filemoon.sx/e/xyz")).toBeNull();
  });
});

describe("resolveFilemoon", () => {
  it("sigue el iframe y resuelve el stream", async () => {
    const packed = readFileSync(FIX("mirrors/filemoon-embed.html"), "utf8");
    const fetchMock = vi.fn(async (input: string) => {
      if (input.includes("/iframe/")) return new Response(packed, { status: 200 });
      return new Response('<html><iframe src="https://filemoon.sx/iframe/xyz"></iframe></html>', { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveFilemoon("https://filemoon.sx/e/xyz");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result?.url).toBe("https://cdn.filemoon.sx/hls/xyz/master.m3u8");
    expect(result?.headers.Referer).toBe("https://filemoon.sx/iframe/xyz");
  });

  it("resuelve sin iframe cuando el embed trae el stream", async () => {
    const packed = readFileSync(FIX("mirrors/filemoon-embed.html"), "utf8");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(packed, { status: 200 })));

    const result = await resolveFilemoon("https://filemoon.sx/e/xyz");
    expect(result?.url).toBe("https://cdn.filemoon.sx/hls/xyz/master.m3u8");
  });
});
