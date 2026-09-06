import {
  fetchTrending,
  fetchPopularMovies,
  fetchPopularTV,
  fetchTopRatedMovies,
  fetchTopRatedTV,
  searchTMDB,
  type TmdbMedia,
} from "./client";

export interface CatalogSection {
  title: string;
  items: TmdbMedia[];
  fetchMore: (page: number) => Promise<{ results: TmdbMedia[] }>;
}

export async function getHomeSections(): Promise<CatalogSection[]> {
  const [trending, popularMovies, popularTV, topMovies, topTV] = await Promise.allSettled([
    fetchTrending(),
    fetchPopularMovies(),
    fetchPopularTV(),
    fetchTopRatedMovies(),
    fetchTopRatedTV(),
  ]);

  const sections: CatalogSection[] = [];

  if (trending.status === "fulfilled") {
    sections.push({
      title: "Tendencias esta semana",
      items: trending.value.results.slice(0, 20),
      fetchMore: (page) => fetchTrending(page),
    });
  }
  if (popularMovies.status === "fulfilled") {
    sections.push({
      title: "Películas populares",
      items: popularMovies.value.results.slice(0, 20),
      fetchMore: (page) => fetchPopularMovies(page),
    });
  }
  if (popularTV.status === "fulfilled") {
    sections.push({
      title: "Series populares",
      items: popularTV.value.results.slice(0, 20),
      fetchMore: (page) => fetchPopularTV(page),
    });
  }
  if (topMovies.status === "fulfilled") {
    sections.push({
      title: "Películas mejor valoradas",
      items: topMovies.value.results.slice(0, 20),
      fetchMore: (page) => fetchTopRatedMovies(page),
    });
  }
  if (topTV.status === "fulfilled") {
    sections.push({
      title: "Series mejor valoradas",
      items: topTV.value.results.slice(0, 20),
      fetchMore: (page) => fetchTopRatedTV(page),
    });
  }

  return sections;
}

export async function searchCatalog(query: string, page = 1): Promise<{ results: TmdbMedia[]; page: number }> {
  if (!query.trim()) return { results: [], page: 1 };
  return searchTMDB(query, page);
}