import { describe, it, expect } from "vitest";
import { qualityFromUrl } from "@services/mirrors/decoders/quality";

describe("qualityFromUrl", () => {
  it("goodstream x = 1080p", () => {
    expect(qualityFromUrl("https://goodstream.one/pl/abc_x,.urlset/index.m3u8")).toBe("1080p");
  });

  it("goodstream h = 720p", () => {
    expect(qualityFromUrl("https://goodstream.one/pl/abc_h,.urlset/index.m3u8")).toBe("720p");
  });

  it("vimeos n = 480p", () => {
    expect(qualityFromUrl("https://vimeos.net/pl/xyz_n,.urlset/manifest.m3u8")).toBe("480p");
  });

  it("streamwish x = 1080p", () => {
    expect(qualityFromUrl("https://hlswish.com/pl/q_x,.urlset/index.m3u8")).toBe("1080p");
  });

  it("voe n = 720p", () => {
    expect(qualityFromUrl("https://cloudwindow.pl/abc_n,.urlset/index.m3u8")).toBe("720p");
  });

  it("resolución numérica en la URL", () => {
    expect(qualityFromUrl("https://cdn.ejemplo.com/video_1080p.m3u8")).toBe("1080p");
  });

  it("URL vacía = Unknown", () => {
    expect(qualityFromUrl("")).toBe("Unknown");
  });

  it("URL sin pistas = Unknown", () => {
    expect(qualityFromUrl("https://ejemplo.com/video.m3u8")).toBe("Unknown");
  });
});