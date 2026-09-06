export function findEpisodeUrl(seasonHtml: string, season: number, episode: number): string | null {
  const epRegex = /href="([^"]+\/capitulo\/[^"]+)"/g;
  for (const match of seasonHtml.matchAll(epRegex)) {
    const url = match[1];
    const m = /temporada-(\d+)-capitulo-(\d+)/i.exec(url);
    if (m && Number(m[1]) === season && Number(m[2]) === episode) {
      return url;
    }
  }
  return null;
}

export function extractPostId(html: string): string | null {
  const m = /data-post="(\d+)"/.exec(html);
  return m?.[1] ?? null;
}