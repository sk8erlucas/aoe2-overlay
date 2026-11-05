/**
 * Sincronización de estrategias con la API, con caché local para funcionar sin internet.
 *
 * - Pide `GET /api/overlay/strategies` con `If-None-Match` (ETag): si nada cambió, la API
 *   responde 304 y se sigue usando la caché.
 * - La caché vive en el store de Tauri (o localStorage en el navegador).
 * - Las estrategias base empaquetadas siempre están disponibles, aunque nunca haya conexión.
 */
import { strategySchema } from "@age-overlay/shared";
import { isTauri } from "@tauri-apps/api/core";
import { BUNDLED_STRATEGIES, type LoadedStrategy } from "./strategies";

/** API de producción. Para desarrollo se puede cambiar con VITE_API_URL. */
export const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://api.aoe2overlay.sitemaster.com.ar"
).replace(/[/]+$/, "");
/** Cada cuánto se vuelve a sincronizar con la app abierta. */
export const SYNC_INTERVAL_MS = 30 * 60 * 1000;

export interface RemoteItem {
  slug: string;
  score: number;
  verified: boolean;
  updatedAt: string;
  data: unknown;
}

export interface StrategyCache {
  apiUrl: string;
  etag: string | null;
  syncedAt: string;
  items: RemoteItem[];
}

export type SyncStatus =
  | { state: "idle" }
  | { state: "syncing" }
  | { state: "ok"; syncedAt: string; count: number }
  | { state: "offline"; message: string; syncedAt: string | null };

const CACHE_KEY = "strategyCache";
const LOCAL_KEY = "aoe2-overlay:strategy-cache";

async function store() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load("cache.json", { defaults: {}, autoSave: false });
}

export async function loadCache(): Promise<StrategyCache | null> {
  try {
    if (isTauri()) return (await (await store()).get<StrategyCache>(CACHE_KEY)) ?? null;
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as StrategyCache) : null;
  } catch {
    return null;
  }
}

async function saveCache(cache: StrategyCache): Promise<void> {
  try {
    if (isTauri()) {
      const s = await store();
      await s.set(CACHE_KEY, cache);
      await s.save();
    } else {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cache));
    }
  } catch (e) {
    console.warn("No se pudo guardar la caché de estrategias", e);
  }
}

export function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * Pide las estrategias a la API. Devuelve la caché nueva (o la misma si no hubo cambios).
 * Lanza error si no hay conexión o la API falla.
 */
export async function syncStrategies(
  apiUrl: string,
  cache: StrategyCache | null,
  fetchImpl: typeof fetch = fetch,
): Promise<StrategyCache> {
  const base = normalizeApiUrl(apiUrl);
  // Si cambió la URL de la API, la caché vieja no sirve para el ETag.
  const sameApi = cache?.apiUrl === base;
  const res = await fetchImpl(`${base}/api/overlay/strategies`, {
    headers: sameApi && cache?.etag ? { "if-none-match": cache.etag } : {},
    signal: AbortSignal.timeout(15_000),
  });

  const now = new Date().toISOString();
  if (res.status === 304 && cache && sameApi) {
    const next = { ...cache, syncedAt: now };
    await saveCache(next);
    return next;
  }
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);

  const body = (await res.json()) as { items: RemoteItem[] };
  const next: StrategyCache = {
    apiUrl: base,
    etag: res.headers.get("etag"),
    syncedAt: now,
    items: body.items,
  };
  await saveCache(next);
  return next;
}

/**
 * Une las estrategias base con las descargadas. Si una descargada tiene el mismo id que
 * una base (las base se cargan en la API con el nombre de archivo como slug), gana la
 * descargada, que trae los votos.
 */
export function mergeStrategies(remote: RemoteItem[] | undefined): LoadedStrategy[] {
  const byId = new Map<string, LoadedStrategy>(
    BUNDLED_STRATEGIES.map((s) => [s.id, { ...s, origin: "bundled" as const }]),
  );
  for (const item of remote ?? []) {
    const parsed = strategySchema.safeParse(item.data);
    if (!parsed.success) continue;
    byId.set(item.slug, {
      ...parsed.data,
      id: item.slug,
      origin: "remote",
      score: item.score,
      verified: item.verified,
    });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}
