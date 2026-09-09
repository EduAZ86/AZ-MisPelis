import { useCallback } from "react";
import { useContinueWatching } from "@features/favorites";
import type { StreamInput, ContinueWatchingItem } from "@core/types";

interface PlaybackProgressOptions {
  input: StreamInput;
  type?: "movie" | "tv";
}

export function usePlaybackProgress({ input }: PlaybackProgressOptions) {
  const { updateProgress, remove } = useContinueWatching();

  const saveProgress = useCallback(
    (progress: number, duration: number) => {
      const item: ContinueWatchingItem = {
        id: input.id,
        type: input.type,
        title: "",
        poster: "",
        progress,
        duration,
        updatedAt: Date.now(),
        season: input.season,
        episode: input.episode,
        addedAt: Date.now(),
        meta_score: undefined,
      };
      updateProgress(item);
    },
    [input, updateProgress]
  );

  const getProgress = useCallback(() => {
    return 0;
  }, []);

  const clearProgress = useCallback(() => {
    remove(input.id, input.type, input.season, input.episode);
  }, [input, remove]);

  return { saveProgress, getProgress, clearProgress };
}