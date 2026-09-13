import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@mispelis:favorites:v1";
const CONTINUE_WATCHING_KEY = "@mispelis:continueWatching:v1";

export interface FavoriteItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster: string;
  meta_score?: number;
  addedAt: number;
}

export interface ContinueWatchingItem extends FavoriteItem {
  season?: number;
  episode?: number;
  progress: number;
  duration: number;
  updatedAt: number;
}

const MAX_CONTINUE_WATCHING = 20;

let favorites: FavoriteItem[] = [];
let continueWatching: ContinueWatchingItem[] = [];
const listeners = new Set<() => void>();

let hydrationStarted = false;
let mutationVersion = 0;

const EMPTY_FAVORITES: FavoriteItem[] = [];
const EMPTY_CONTINUE_WATCHING: ContinueWatchingItem[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  startHydration();
  return () => {
    listeners.delete(listener);
  };
}

export function getFavoritesSnapshot(): FavoriteItem[] {
  return favorites;
}

export function getContinueWatchingSnapshot(): ContinueWatchingItem[] {
  return continueWatching;
}

export function getFavoritesServerSnapshot(): FavoriteItem[] {
  return EMPTY_FAVORITES;
}

export function getContinueWatchingServerSnapshot(): ContinueWatchingItem[] {
  return EMPTY_CONTINUE_WATCHING;
}

function favoriteKey(item: Pick<FavoriteItem, "id" | "type">) {
  return `${item.type}:${item.id}`;
}

function continueKey(
  item: Pick<ContinueWatchingItem, "id" | "type" | "season" | "episode">
) {
  return `${item.type}:${item.id}:${item.season ?? ""}:${item.episode ?? ""}`;
}

function parse<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function mergeFavorites(stored: FavoriteItem[], local: FavoriteItem[]): FavoriteItem[] {
  const merged = new Map<string, FavoriteItem>();
  for (const item of stored) merged.set(favoriteKey(item), item);
  for (const item of local) merged.set(favoriteKey(item), item);
  return Array.from(merged.values());
}

function mergeContinueWatching(
  stored: ContinueWatchingItem[],
  local: ContinueWatchingItem[]
): ContinueWatchingItem[] {
  const merged = new Map<string, ContinueWatchingItem>();
  for (const item of stored) merged.set(continueKey(item), item);
  for (const item of local) merged.set(continueKey(item), item);
  return Array.from(merged.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_CONTINUE_WATCHING);
}

async function startHydration() {
  if (hydrationStarted) return;
  hydrationStarted = true;
  const versionAtStart = mutationVersion;
  try {
    const [storedFavorites, storedContinueWatching] = await Promise.all([
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(CONTINUE_WATCHING_KEY),
    ]);
    const parsedFavorites = parse<FavoriteItem>(storedFavorites);
    const parsedContinueWatching = parse<ContinueWatchingItem>(storedContinueWatching);

    if (mutationVersion === versionAtStart) {
      favorites = parsedFavorites;
      continueWatching = parsedContinueWatching.slice(0, MAX_CONTINUE_WATCHING);
    } else {
      favorites = mergeFavorites(parsedFavorites, favorites);
      continueWatching = mergeContinueWatching(parsedContinueWatching, continueWatching);
    }
  } catch {
    // Sin datos persistidos disponibles: se trabaja en memoria.
  } finally {
    emit();
  }
}

function persist(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch((e) =>
    console.error("Failed to save favorites:", e)
  );
}

export function toggleFavorite(item: FavoriteItem) {
  const exists = favorites.some((f) => favoriteKey(f) === favoriteKey(item));
  favorites = exists
    ? favorites.filter((f) => favoriteKey(f) !== favoriteKey(item))
    : [{ ...item, addedAt: item.addedAt || Date.now() }, ...favorites];
  mutationVersion += 1;
  persist(FAVORITES_KEY, favorites);
  emit();
}

export function isFavorite(id: number, type: "movie" | "tv") {
  return favorites.some((f) => f.id === id && f.type === type);
}

export function updateContinueWatching(item: ContinueWatchingItem) {
  const filtered = continueWatching.filter(
    (i) => continueKey(i) !== continueKey(item)
  );
  continueWatching = [item, ...filtered].slice(0, MAX_CONTINUE_WATCHING);
  mutationVersion += 1;
  persist(CONTINUE_WATCHING_KEY, continueWatching);
  emit();
}

export function removeContinueWatching(
  id: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number
) {
  continueWatching = continueWatching.filter(
    (i) =>
      !(i.id === id && i.type === type && i.season === season && i.episode === episode)
  );
  mutationVersion += 1;
  persist(CONTINUE_WATCHING_KEY, continueWatching);
  emit();
}
