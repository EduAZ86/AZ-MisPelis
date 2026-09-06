import { describe, it, expect } from "vitest";
import { findEpisodeUrl, extractPostId } from "@services/seriesmetro/episodes";

describe("extractPostId", () => {
  it("extrae data-post del HTML", () => {
    expect(extractPostId('<div data-post="12345" class="serie">')).toBe("12345");
  });

  it("retorna null si no existe", () => {
    expect(extractPostId("<div>sin post</div>")).toBeNull();
  });
});

describe("findEpisodeUrl", () => {
  const html = `
    <a href="https://www3.seriesmetro.net/serie/breaking-bad/capitulo/temporada-2-capitulo-4/">ep4</a>
    <a href="https://www3.seriesmetro.net/serie/breaking-bad/capitulo/temporada-2-capitulo-5/">ep5</a>
    <a href="https://www3.seriesmetro.net/serie/breaking-bad/capitulo/temporada-3-capitulo-1/">ep3x1</a>
  `;

  it("encuentra el episodio correcto", () => {
    expect(findEpisodeUrl(html, 2, 5)).toBe(
      "https://www3.seriesmetro.net/serie/breaking-bad/capitulo/temporada-2-capitulo-5/"
    );
  });

  it("no confunde temporada 2 con temporada 3", () => {
    expect(findEpisodeUrl(html, 3, 1)).toBe(
      "https://www3.seriesmetro.net/serie/breaking-bad/capitulo/temporada-3-capitulo-1/"
    );
  });

  it("retorna null si el episodio no existe", () => {
    expect(findEpisodeUrl(html, 9, 9)).toBeNull();
  });
});