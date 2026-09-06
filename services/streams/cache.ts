import type { StreamInput, StreamSource } from "@core/types";

const TTL = 3 * 60 * 60 * 1000;
const cache = new Map<string, { value: StreamSource[]; at: number }>();
const inFlight = new Map<string, Promise<StreamSource[]>>();

function keyOf(input: StreamInput): string {
  return `${input.type}:${input.id}:${input.season ?? ""}:${input.episode ?? ""}`;
}

export async function getCached(key: string): Promise<StreamSource[] | null> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL) return cached.value;
  return null;
}

export function setCache(key: string, value: StreamSource[]): void {
  cache.set(key, { value, at: Date.now() });
}

export async function withDedupe(key: string, factory: () => Promise<StreamSource[]>): Promise<StreamSource[]> {
  const pending = inFlight.get(key) ?? factory();
  if (!inFlight.has(key)) inFlight.set(key, pending);
  try {
    return await pending;
  } finally {
    inFlight.delete(key);
  }
}

export { keyOf };