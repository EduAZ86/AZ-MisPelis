import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { unpackPacked, grabHls, grabFile } from "@services/mirrors/decoders/packed-js";
import { extractServerSpans, extractTrembedParams, sortSpansByLanguage } from "@services/seriesmetro/embed-extract";
import { extractPostId } from "@services/seriesmetro/episodes";

const FIX = (p: string) => resolve(__dirname, "..", "__fixtures__", p);

describe("fixtures reales: fastream embed", () => {
  const html = readFileSync(FIX("mirrors/fastream-embed.html"), "utf8");

  it("unpackPacked desempaqueta el player real", () => {
    const unpacked = unpackPacked(html);
    expect(unpacked).not.toBe(html);
    expect(unpacked).toContain("m3u8");
  });

  it("grabHls extrae el m3u8 del player desempaquetado", () => {
    const unpacked = unpackPacked(html);
    const hls = grabHls(unpacked);
    expect(hls).toMatch(/^https?:\/\/.+\.m3u8/);
  });
});

describe("fixtures reales: goodstream embed", () => {
  const html = readFileSync(FIX("mirrors/goodstream-embed.html"), "utf8");

  it("extrae file: con m3u8 firmado", () => {
    const target = grabFile("https://goodstream.one/embed-x.html", html);
    expect(target).toMatch(/^https:\/\/.+\.m3u8\?t=/);
  });

  it("contiene subtítulo VTT", () => {
    expect(html).toMatch(/vtt/);
  });
});

describe("fixtures reales: seriesmetro página película", () => {
  const html = readFileSync(FIX("seriesmetro/movie-page.html"), "utf8");

  it("contiene trembed params", () => {
    const params = extractTrembedParams(html);
    expect(params).not.toBeNull();
    expect(params!.trid).toMatch(/^\d+$/);
    expect(params!.trtype).toBe("1");
  });

  it("extrae server spans con idioma", () => {
    const spans = extractServerSpans(html);
    expect(spans.length).toBeGreaterThan(0);
    expect(spans.some((s) => /latino/i.test(s.label))).toBe(true);
  });

  it("sortSpansByLanguage pone latino primero", () => {
    const spans = sortSpansByLanguage(extractServerSpans(html));
    expect(spans[0].label.toLowerCase()).toContain("latino");
  });
});

describe("fixtures reales: seriesmetro página serie", () => {
  const html = readFileSync(FIX("seriesmetro/serie-page.html"), "utf8");

  it("contiene data-post para admin-ajax", () => {
    expect(extractPostId(html)).toMatch(/^\d+$/);
  });
});

describe("fixtures reales: hackstore", () => {
  it("single devuelve _id de película", () => {
    const json = JSON.parse(readFileSync(FIX("hackstore/single-movie.json"), "utf8"));
    expect(json.data._id).toBe(63402);
  });

  it("player devuelve embeds con idioma y mirrors conocidos", () => {
    const json = JSON.parse(readFileSync(FIX("hackstore/player.json"), "utf8"));
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].lang).toBe("Latino");
    const urls = json.data.map((e: { url: string }) => e.url).join(",");
    expect(urls).toMatch(/vimeos|goodstream|hlswish|voe/);
  });
});

describe("fixtures reales: tmdb", () => {
  it("movie-popular tiene resultados con poster", () => {
    const json = JSON.parse(readFileSync(FIX("tmdb/movie-popular.json"), "utf8"));
    expect(json.results.length).toBeGreaterThan(0);
    expect(json.results[0].title).toBeTruthy();
  });

  it("movie-detail tiene título y fecha", () => {
    const json = JSON.parse(readFileSync(FIX("tmdb/movie-detail.json"), "utf8"));
    expect(json.title).toBeTruthy();
    expect(json.release_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});