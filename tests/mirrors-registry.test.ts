import { describe, it, expect } from "vitest";
import {
  resolverFor,
  mirrorName,
  resolveVidhide,
  resolveFilemoon,
  resolveDoodstream,
  resolveGoodstream,
} from "@services/mirrors";

describe("resolverFor", () => {
  it("resuelve hosts existentes", () => {
    expect(resolverFor("https://goodstream.one/e/abc")).toBe(resolveGoodstream);
  });

  it("resuelve vidhide y sus alias de ruta", () => {
    expect(resolverFor("https://vidhide.com/v/abc")).toBe(resolveVidhide);
    expect(resolverFor("https://vidhidepro.com/d/abc")).toBe(resolveVidhide);
  });

  it("resuelve filemoon", () => {
    expect(resolverFor("https://filemoon.sx/e/abc")).toBe(resolveFilemoon);
  });

  it("resuelve doodstream y mirrors rotativos", () => {
    expect(resolverFor("https://doodstream.com/e/abc")).toBe(resolveDoodstream);
    expect(resolverFor("https://playmogo.com/e/abc")).toBe(resolveDoodstream);
  });

  it("retorna null para hosts sin resolver", () => {
    expect(resolverFor("https://desconocido.example/e/abc")).toBeNull();
  });
});

describe("mirrorName", () => {
  it("etiqueta los nuevos hosts", () => {
    expect(mirrorName("https://vidhide.com/v/abc")).toBe("VidHide");
    expect(mirrorName("https://filemoon.sx/e/abc")).toBe("Filemoon");
    expect(mirrorName("https://playmogo.com/e/abc")).toBe("Doodstream");
  });

  it("mantiene etiquetas existentes", () => {
    expect(mirrorName("https://goodstream.one/e/abc")).toBe("GoodStream");
    expect(mirrorName("https://cloudwindow.pl/e/abc")).toBe("VOE");
  });
});
