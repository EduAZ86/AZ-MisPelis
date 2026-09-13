import { useCallback, useSyncExternalStore } from "react";
import {
  subscribe,
  getFavoritesSnapshot,
  getContinueWatchingSnapshot,
  getFavoritesServerSnapshot,
  getContinueWatchingServerSnapshot,
  toggleFavorite,
  isFavorite as isFavoriteInStore,
  updateContinueWatching,
  removeContinueWatching,
  type FavoriteItem,
  type ContinueWatchingItem,
} from "../store";

export type { FavoriteItem, ContinueWatchingItem } from "../store";

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  );

  const toggle = useCallback((item: FavoriteItem) => {
    toggleFavorite(item);
  }, []);

  const isFavorite = useCallback(
    (id: number, type: "movie" | "tv") => isFavoriteInStore(id, type),
    []
  );

  return { favorites, toggle, isFavorite };
}

export function useContinueWatching() {
  const items = useSyncExternalStore(
    subscribe,
    getContinueWatchingSnapshot,
    getContinueWatchingServerSnapshot
  );

  const updateProgress = useCallback((item: ContinueWatchingItem) => {
    updateContinueWatching(item);
  }, []);

  const remove = useCallback(
    (id: number, type: "movie" | "tv", season?: number, episode?: number) => {
      removeContinueWatching(id, type, season, episode);
    },
    []
  );

  return { items, updateProgress, remove };
}
