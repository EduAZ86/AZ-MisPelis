export function slugify(title: string, year?: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return year ? `${base}-${year}` : base;
}

export function buildPostName(type: "movie" | "tv", title: string, year: string, season?: number, episode?: number): string {
  const slug = slugify(title, year);
  if (type === "movie") return slug;
  return `${slug}-temporada-${season}-episodio-${episode}`;
}