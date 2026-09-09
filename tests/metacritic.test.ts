import { describe, it, expect } from "vitest";
import { pickBestScore, type MetaSearchItem } from "@services/metacritic/api";
import { metaQuery } from "@services/metacritic/cache";
import type { TmdbMedia } from "@core/types";

describe("pickBestScore", () => {
  const items: MetaSearchItem[] = [
    { title: "The Matrix", slug: "the-matrix", type: "movie", premiereYear: 1999, criticScoreSummary: { score: 73 } },
    { title: "The Matrix Reloaded", slug: "the-matrix-reloaded", type: "movie", premiereYear: 2003, criticScoreSummary: { score: 62 } },
  ];

  it("elige el score del match exacto de título", () => {
    expect(pickBestScore(items, "The Matrix")).toBe(73);
  });

  it("prioriza match exacto + año", () => {
    expect(pickBestScore(items, "The Matrix", 1999)).toBe(73);
  });

  it("es insensible a espacios/mayúsculas", () => {
    expect(pickBestScore(items, "  the   matrix ")).toBe(73);
  });

  it("devuelve undefined con lista vacía", () => {
    expect(pickBestScore([], "anything")).toBeUndefined();
  });

  it("devuelve undefined si NO hay match exacto (evita score inflado del fuzzy)", () => {
    const items: MetaSearchItem[] = [
      { title: "Elevator to the Gallows", slug: "x", type: "movie", premiereYear: 1958, criticScoreSummary: { score: 94 } },
      { title: "Elle", slug: "y", type: "movie", premiereYear: 2016, criticScoreSummary: { score: 89 } },
    ];
    expect(pickBestScore(items, "Carrera contra el tiempo")).toBeUndefined();
  });
});

describe("metaQuery", () => {
  it("usa el título original ASCII para películas", () => {
    const item = { media_type: "movie", original_title: "Oppenheimer", title: "Oppenheimer" } as TmdbMedia;
    expect(metaQuery(item)).toBe("Oppenheimer");
  });

  it("usa original_name ASCII para series", () => {
    const item = { media_type: "tv", original_name: "Breaking Bad", name: "Breaking Bad" } as TmdbMedia;
    expect(metaQuery(item)).toBe("Breaking Bad");
  });

  it("cae al título local si el original tiene caracteres no ASCII", () => {
    const item = { media_type: "movie", original_title: "Código", title: "Código" } as TmdbMedia;
    expect(metaQuery(item)).toBe("Código");
  });
});
