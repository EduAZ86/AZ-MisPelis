import { AppError, toAppError } from "@core/errors";

const BASE = "https://hackstore2.com/api/rest";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

async function fetchJson<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "follow",
    });
    if (!res.ok) throw new AppError("NETWORK", `HackStore HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } catch (e) {
    throw toAppError(e, "NETWORK");
  }
}

export interface HackStoreSingleResponse {
  data?: {
    _id?: string;
    episode?: { _id?: string };
  };
}

export interface HackStorePlayerResponse {
  data?: { url?: string; lang?: string }[];
}

export async function fetchSingle(postName: string, postType: "movies" | "episodes"): Promise<HackStoreSingleResponse> {
  const url = `${BASE}/single?post_name=${encodeURIComponent(postName)}&post_type=${postType}`;
  return fetchJson<HackStoreSingleResponse>(url);
}

export async function fetchPlayer(postId: string): Promise<HackStorePlayerResponse> {
  const url = `${BASE}/player?post_id=${encodeURIComponent(postId)}`;
  return fetchJson<HackStorePlayerResponse>(url);
}