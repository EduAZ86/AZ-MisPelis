import { useEffect, useSyncExternalStore } from "react";
import type { TmdbMedia } from "@core/types";
import { metaKey, resolveScore, getCachedScore, subscribe } from "@services/metacritic";

export function useMetaScore(item: TmdbMedia): number | undefined {
  const key = metaKey(item);

  useEffect(() => {
    if (getCachedScore(key) === undefined) {
      resolveScore(key, item).catch(() => {});
    }
  }, [key, item]);

  return useSyncExternalStore(subscribe, () => getCachedScore(key) ?? undefined);
}
