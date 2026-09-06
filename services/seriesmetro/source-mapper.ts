import { fetchSeasonEpisodes } from "./page-fetch";
import { extractPostId, findEpisodeUrl } from "./episodes";
import { extractServerSpans, extractTrembedParams, sortSpansByLanguage, resolveServerSpan } from "./embed-extract";
import { fetchTmdbTitles, getYear } from "@services/tmdb";
import type { LatinoSource, StreamInput } from "@core/types";
import { slugify } from "@services/hackstore/slug";

async function fetchHtmlWithFallback(url: string): Promise<string> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

export async function getSeriesMetroSources(input: StreamInput): Promise<LatinoSource[]> {
  const titles = await fetchTmdbTitles(input.type, input.id);
  const typeSlug = input.type === "movie" ? "pelicula" : "serie";
  const candidates = [titles.esMx, titles.esEs, titles.enUs, titles.original].filter(Boolean);

  let page: { url: string; html: string } | null = null;
  for (const t of candidates) {
    const slug = slugify(t, getYear({} as any, input.type));
    const url = `https://www3.seriesmetro.net/${typeSlug}/${slug}/`;
    const html = await fetchHtmlWithFallback(url);
    if (html.includes("trembed=") || html.includes("data-post=")) {
      page = { url, html };
      break;
    }
  }
  if (!page) return [];

  let pageUrl = page.url;
  let pageHtml = page.html;

  if (input.type === "tv" && input.season && input.episode) {
    const postId = extractPostId(pageHtml);
    if (!postId) return [];
    const seasonHtml = await fetchSeasonEpisodes(pageUrl, postId, input.season);
    const epUrl = findEpisodeUrl(seasonHtml, input.season, input.episode);
    if (!epUrl) return [];
    pageUrl = epUrl;
    pageHtml = await fetchHtmlWithFallback(pageUrl);
  }

  const serverSpans = extractServerSpans(pageHtml);
  const trembedParams = extractTrembedParams(pageHtml);
  const trid = trembedParams?.trid;
  const trtype = trembedParams?.trtype;

  if (!serverSpans.length || !trid || !trtype) return [];

  const sortedSpans = sortSpansByLanguage(serverSpans);
  const results: LatinoSource[] = [];

  for (const span of sortedSpans) {
    const source = await resolveServerSpan("https://www3.seriesmetro.net", span.id, trid, trtype, span, pageUrl);
    if (source) results.push(source);
  }

  return results;
}