import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TmdbMedia } from "@core/types";
import { searchMetaScore } from "./api";

const CACHE_KEY = "@mispelis:metacritic:v1";
const MAX_CONCURRENT = 5;

/** query para Metacritic: título original si es ASCII (Metacritic usa títulos en inglés/ASCII). */
export function metaQuery(item: TmdbMedia): string {
  const isMovie = item.media_type === "movie";
  if (isMovie) {
    const orig = item.original_title?.trim();
    if (orig && /^[\x20-\x7E]+$/.test(orig)) return orig;
    return item.title?.trim() ?? "";
  }
  const orig = item.original_name?.trim();
  if (orig && /^[\x20-\x7E]+$/.test(orig)) return orig;
  return item.name?.trim() ?? "";
}

export function metaKey(item: TmdbMedia): string {
  return `${item.media_type}|${metaQuery(item).toLowerCase()}`;
}

interface MetaStore {
  /** key -> metascore (0-100) o null (buscado y sin match) */
  values: Map<string, number | null>;
  listeners: Set<() => void>;
  inflight: Map<string, Promise<void>>;
  hydrated: boolean;
}

const store: MetaStore = {
  values: new Map(),
  listeners: new Set(),
  inflight: new Map(),
  hydrated: false,
};

function notify(): void {
  store.listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

export { subscribe };

export function getCachedScore(key: string): number | null | undefined {
  return store.values.get(key);
}

async function hydrate(): Promise<void> {
  if (store.hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number | null>;
      Object.entries(parsed).forEach(([k, v]) => store.values.set(k, v));
    }
  } catch {
    // sincroniza sin datos
  }
  store.hydrated = true;
}

function persist(): void {
  const obj = Object.fromEntries(store.values);
  AsyncStorage.setItem(CACHE_KEY, JSON.stringify(obj)).catch(() => {});
}

// --- semáforo simple para no saturar Metacritic ---
let active = 0;
const queue: (() => void)[] = [];

function acquire(): Promise<void> {
  return new Promise((resolve) => {
    const run = () => {
      active++;
      resolve();
    };
    if (active < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

function release(): void {
  active--;
  const next = queue.shift();
  if (next) next();
}

export async function resolveScore(key: string, item: TmdbMedia): Promise<void> {
  if (store.values.has(key)) return;
  const pending = store.inflight.get(key);
  if (pending) return pending;

  const p = (async () => {
    await hydrate();
    if (store.values.has(key)) return;
    await acquire();
    let score: number | null = null;
    try {
      const query = metaQuery(item);
      const type = item.media_type === "tv" ? "tv" : "movie";
      const year = Number((item.release_date ?? item.first_air_date ?? "").slice(0, 4)) || undefined;
      const found = query ? await searchMetaScore(query, type, year) : undefined;
      score = found ?? null;
    } catch {
      score = null;
    }
    store.values.set(key, score);
    persist();
    release();
    notify();
  })();

  store.inflight.set(key, p);
  await p;
  store.inflight.delete(key);
}
