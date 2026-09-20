import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractVidhideStream, resolveVidhide } from "@services/mirrors/vidhide";

const FIX = (p: string) => resolve(__dirname, "..", "__fixtures__", p);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("extractVidhideStream", () => {
  const html = readFileSync(FIX("mirrors/vidhide-embed.html"), "utf8");

  it("desempaqueta el player y extrae el m3u8", () => {
    expect(extractVidhideStream(html, "https://vidhide.com/v/abc")).toBe(
      "https://cdn.vidhide.com/hls/abc/master.m3u8"
    );
  });

  it("extrae m3u8 de HTML sin empaquetar", () => {
    const plain = '<script>sources:[{file:"https://cdn.vidhide.com/hls/plain/master.m3u8"}]</script>';
    expect(extractVidhideStream(plain, "https://vidhide.com/v/abc")).toBe(
      "https://cdn.vidhide.com/hls/plain/master.m3u8"
    );
  });

  it("retorna null si no hay m3u8", () => {
    expect(extractVidhideStream("<div>nada</div>", "https://vidhide.com/v/abc")).toBeNull();
  });
});

describe("resolveVidhide", () => {
  it("normaliza /d/ a /v/ y resuelve el stream", async () => {
    const html = readFileSync(FIX("mirrors/vidhide-embed.html"), "utf8");
    const fetchMock = vi.fn(async () => new Response(html, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveVidhide("https://vidhide.com/d/abc");

    expect(fetchMock).toHaveBeenCalledWith("https://vidhide.com/v/abc", expect.any(Object));
    expect(result?.url).toBe("https://cdn.vidhide.com/hls/abc/master.m3u8");
    expect(result?.headers.Referer).toBe("https://vidhide.com/v/abc");
    expect(result?.headers.Origin).toBe("https://vidhide.com");
  });

  it("retorna null ante error HTTP", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 403 })));
    expect(await resolveVidhide("https://vidhide.com/v/abc")).toBeNull();
  });
});
