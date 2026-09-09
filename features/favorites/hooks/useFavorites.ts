import { useState, useCallback, useEffect } from "react";
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

async function readFavorites(): Promise<FavoriteItem[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? (JSON.parse(stored) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    readFavorites().then(setFavorites);
  }, []);

  const toggle = useCallback((item: FavoriteItem) => {
    setFavorites((current) => {
      const exists = current.find((f) => f.id === item.id && f.type === item.type);
      const next = exists
        ? current.filter((f) => f.id !== item.id || f.type !== item.type)
        : [{ ...item, addedAt: Date.now() }, ...current];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch((e) =>
        console.error("Failed to save favorites:", e)
      );
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: number, type: "movie" | "tv") => favorites.some((f) => f.id === id && f.type === type),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}

async function readContinueWatching(): Promise<ContinueWatchingItem[]> {
  try {
    const stored = await AsyncStorage.getItem(CONTINUE_WATCHING_KEY);
    return stored ? (JSON.parse(stored) as ContinueWatchingItem[]) : [];
  } catch {
    return [];
  }
}

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    readContinueWatching().then(setItems);
  }, []);

  const updateProgress = useCallback(
    (item: ContinueWatchingItem) => {
      setItems((current) => {
        const filtered = current.filter(
          (i) => !(i.id === item.id && i.type === item.type && i.season === item.season && i.episode === item.episode)
        );
        const next = [item, ...filtered].slice(0, 20);
        AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next)).catch((e) =>
          console.error("Failed to save continue watching:", e)
        );
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (id: number, type: "movie" | "tv", season?: number, episode?: number) => {
      setItems((current) => {
        const next = current.filter(
          (i) => !(i.id === id && i.type === type && i.season === season && i.episode === episode)
        );
        AsyncStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(next)).catch((e) =>
          console.error("Failed to save continue watching:", e)
        );
        return next;
      });
    },
    []
  );

  return { items, updateProgress, remove };
}