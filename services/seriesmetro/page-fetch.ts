import { AppError, toAppError } from "@core/errors";

const BASE = "https://www3.seriesmetro.net";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

const HTML_HEADERS = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

async function fetchText(url: string, extraHeaders: Record<string, string> = {}): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { ...HTML_HEADERS, ...extraHeaders },
      redirect: "follow",
    });
    if (!res.ok) throw new AppError("NETWORK", `SeriesMetro HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

async function fetchForm(url: string, body: URLSearchParams, referer: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...HTML_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: referer,
      },
      body: body.toString(),
      redirect: "follow",
    });
    if (!res.ok) throw new AppError("NETWORK", `SeriesMetro HTTP ${res.status}`);
    return res.text();
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export async function fetchMoviePage(slug: string): Promise<{ url: string; html: string }> {
  const url = `${BASE}/pelicula/${slug}/`;
  const html = await fetchText(url);
  return { url, html };
}

export async function fetchSeriesPage(slug: string): Promise<{ url: string; html: string }> {
  const url = `${BASE}/serie/${slug}/`;
  const html = await fetchText(url);
  return { url, html };
}

export async function fetchSeasonEpisodes(
  pageUrl: string,
  postId: string,
  season: number
): Promise<string> {
  const body = new URLSearchParams({
    action: "action_select_season",
    post: postId,
    season: String(season),
  });
  return fetchForm(`${BASE}/wp-admin/admin-ajax.php`, body, pageUrl);
}

export { BASE };