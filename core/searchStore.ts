import { useSyncExternalStore } from "react";

let query = "";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return query;
}

function setQuery(next: string) {
  if (next === query) return;
  query = next;
  listeners.forEach((l) => l());
}

export function useSearchQuery(): string {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export { setQuery as setSearchQuery };
