import { useSyncExternalStore } from "react";

export interface NavFilterChips {
  sortLabel: string;
  genreLabel: string | null;
  yearLabel: number | null;
  onOpen: () => void;
  onClearGenre: () => void;
  onClearYear: () => void;
}

let chips: NavFilterChips | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return chips;
}

export function setNavFilterChips(next: NavFilterChips | null) {
  if (next === chips) return;
  chips = next;
  listeners.forEach((l) => l());
}

export function useNavFilterChips(): NavFilterChips | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}
