import { useCallback } from "react";
import { useContinueWatching } from "@features/favorites";
import type { StreamInput, ContinueWatchingItem } from "@core/types";

export interface PlaybackMetadata {
  input: StreamInput;
  title?: string;
  poster?: string;
  meta_score?: number;
}

export interface PlaybackProgress {
  saveProgress: (positionSec: number, durationSec: number) => void;
  getProgress: () => number;
  clearProgress: () => void;
}

export function usePlaybackProgress({
  input,
  title,
  poster,
  meta_score,
}: PlaybackMetadata): PlaybackProgress {
  const { items, updateProgress, remove } = useContinueWatching();

  const getProgress = useCallback(() => {
    const found = items.find(
      (i) =>
        i.id === input.id &&
        i.type === input.type &&
        i.season === input.season &&
        i.episode === input.episode
    );
    return found?.progress ?? 0;
  }, [items, input.id, input.type, input.season, input.episode]);

  const saveProgress = useCallback(
    (positionSec: number, durationSec: number) => {
      if (!title || !Number.isFinite(durationSec) || durationSec <= 0) return;
      const item: ContinueWatchingItem = {
        id: input.id,
        type: input.type,
        title,
        poster: poster ?? "",
        progress: Math.min(Math.max(positionSec / durationSec, 0), 1),
        duration: durationSec,
        updatedAt: Date.now(),
        season: input.season,
        episode: input.episode,
        addedAt: Date.now(),
        meta_score,
      };
      updateProgress(item);
    },
    [
      input.id,
      input.type,
      input.season,
      input.episode,
      title,
      poster,
      meta_score,
      updateProgress,
    ]
  );

  const clearProgress = useCallback(() => {
    remove(input.id, input.type, input.season, input.episode);
  }, [input.id, input.type, input.season, input.episode, remove]);

  return { saveProgress, getProgress, clearProgress };
}
