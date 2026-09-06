import { describe, it, expect } from "vitest";
import {
  extractServerSpans,
  extractTrembedParams,
  sortSpansByLanguage,
} from "@services/seriesmetro/embed-extract";

describe("extractServerSpans", () => {
  it("extrae spans de servidores con id y label", () => {
    const html = `
      <a href="#options-1"><span class="server">Fastream-Latino</span></a>
      <a href="#options-2"><span class="server">Voe-VOSE</span></a>
    `;
    const spans = extractServerSpans(html);
    expect(spans).toHaveLength(2);
    expect(spans[0]).toEqual({ id: "1", label: "Fastream-Latino" });
    expect(spans[1]).toEqual({ id: "2", label: "Voe-VOSE" });
  });

  it("retorna vacío sin servidores", () => {
    expect(extractServerSpans("<div>sin servidores</div>")).toEqual([]);
  });
});

describe("extractTrembedParams", () => {
  it("extrae trid y trtype con entidades HTML", () => {
    const html = "?trembed=1&#038;trid=123&#038;trtype=2";
    expect(extractTrembedParams(html)).toEqual({ trembed: "1", trid: "123", trtype: "2" });
  });

  it("extrae con & normal", () => {
    const html = "?trembed=0&trid=99&trtype=1";
    expect(extractTrembedParams(html)).toEqual({ trembed: "0", trid: "99", trtype: "1" });
  });

  it("retorna null sin params", () => {
    expect(extractTrembedParams("nada por aqui")).toBeNull();
  });
});

describe("sortSpansByLanguage", () => {
  it("ordena latino primero, subtitulado después", () => {
    const spans = [
      { id: "1", label: "Voe-VOSE" },
      { id: "2", label: "Fastream-Latino" },
      { id: "3", label: "Goodstream-Sub" },
    ];
    const sorted = sortSpansByLanguage(spans);
    expect(sorted.map((s) => s.id)).toEqual(["2", "1", "3"]);
  });
});