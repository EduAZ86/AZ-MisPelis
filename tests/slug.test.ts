import { describe, it, expect } from "vitest";
import { slugify, buildPostName } from "@services/hackstore/slug";

describe("slugify", () => {
  it("convierte título con acentos y símbolos", () => {
    expect(slugify("Rápidos y Furiosos: 007!")).toBe("rapidos-y-furiosos-007");
  });

  it("agrega año cuando se provee", () => {
    expect(slugify("Titanic", "1997")).toBe("titanic-1997");
  });

  it("normaliza múltiples espacios y guiones", () => {
    expect(slugify("El  Señor   de --los Anillos")).toBe("el-senor-de-los-anillos");
  });

  it("elimina guiones de los bordes", () => {
    expect(slugify("- Hola -")).toBe("hola");
  });
});

describe("buildPostName", () => {
  it("película usa slug con año", () => {
    expect(buildPostName("movie", "Coco", "2017")).toBe("coco-2017");
  });

  it("serie usa temporada y episodio", () => {
    expect(buildPostName("tv", "Breaking Bad", "2008", 2, 5)).toBe(
      "breaking-bad-2008-temporada-2-episodio-5"
    );
  });
});