import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  extractDoodPassPath,
  buildDoodDirectLink,
  doodRandomToken,
  resolveDoodstream,
} from "@services/mirrors/doodstream";

const FIX = (p: string) => resolve(__dirname, "..", "__fixtures__", p);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("extractDoodPassPath", () => {
  const html = readFileSync(FIX("mirrors/doodstream-embed.html"), "utf8");

  it("extrae la ruta pass_md5 del embed", () => {
    expect(extractDoodPassPath(html)).toBe("/pass_md5/1a2b3c4d5e/9f8e7d6c5b");
  });

  it("retorna null si no hay pass_md5", () => {
    expect(extractDoodPassPath("<div>nada</div>")).toBeNull();
  });
});

describe("buildDoodDirectLink", () => {
  it("usa el último segmento como token", () => {
    expect(buildDoodDirectLink("https://cdn.dood.com/", "/pass_md5/abc/9f8e7d6c5b", "ABCDEFGHIJ", 1700000000)).toBe(
      "https://cdn.dood.com/ABCDEFGHIJ?token=9f8e7d6c5b&expiry=1700000000"
    );
  });
});

describe("doodRandomToken", () => {
  it("genera 10 caracteres alfanuméricos", () => {
    const token = doodRandomToken();
    expect(token).toHaveLength(10);
    expect(token).toMatch(/^[A-Za-z0-9]{10}$/);
  });
});

describe("resolveDoodstream", () => {
  it("completa el handshake pass_md5 y devuelve el mp4 directo", async () => {
    const html = readFileSync(FIX("mirrors/doodstream-embed.html"), "utf8");
    const fetchMock = vi.fn(async (input: string) => {
      if (input.includes("/pass_md5/")) return new Response("https://cdn.dood.com/", { status: 200 });
      return new Response(html, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveDoodstream("https://doodstream.com/d/xyz");

    expect(fetchMock).toHaveBeenCalledWith("https://doodstream.com/e/xyz", expect.any(Object));
    expect(result?.url).toMatch(
      /^https:\/\/cdn\.dood\.com\/[A-Za-z0-9]{10}\?token=9f8e7d6c5b&expiry=\d+$/
    );
    expect(result?.quality).toBe("auto");
    expect(result?.headers.Referer).toBe("https://doodstream.com/");
  });

  it("retorna null si pass_md5 no responde con URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        if (input.includes("/pass_md5/")) return new Response("RELOAD", { status: 200 });
        return new Response(readFileSync(FIX("mirrors/doodstream-embed.html"), "utf8"), { status: 200 });
      })
    );

    expect(await resolveDoodstream("https://doodstream.com/d/xyz")).toBeNull();
  });
});
