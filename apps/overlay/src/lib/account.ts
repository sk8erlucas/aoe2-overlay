/**
 * Cuenta opcional del overlay: login con código (device authorization, RFC 8628).
 *
 * 1. El overlay pide un código a la API (`/api/auth/device/code`).
 * 2. Muestra el código y abre la web en `/dispositivo`, donde el usuario lo confirma.
 * 3. Mientras tanto consulta `/api/auth/device/token` hasta recibir el token de sesión.
 * 4. Guarda el token y lo manda como `Authorization: Bearer` (favoritas, etc.).
 *
 * Sin cuenta todo sigue funcionando: solo no aparecen las favoritas.
 */
import { isTauri } from "@tauri-apps/api/core";
import { normalizeApiUrl } from "./sync";

/** Tiene que coincidir con OVERLAY_CLIENT_ID de la API. */
export const CLIENT_ID = "aoe2-overlay";
const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";

export interface Account {
  apiUrl: string;
  token: string;
  name: string;
}

export interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

const KEY = "account";
const LOCAL_KEY = "aoe2-overlay:account";

async function store() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load("account.json", { defaults: {}, autoSave: false });
}

export async function loadAccount(): Promise<Account | null> {
  try {
    if (isTauri()) return (await (await store()).get<Account>(KEY)) ?? null;
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Account) : null;
  } catch {
    return null;
  }
}

export async function saveAccount(account: Account | null): Promise<void> {
  if (isTauri()) {
    const s = await store();
    if (account) await s.set(KEY, account);
    else await s.delete(KEY);
    await s.save();
  } else if (account) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(account));
  } else {
    localStorage.removeItem(LOCAL_KEY);
  }
}

/** Abre una URL en el navegador del sistema. */
export async function openInBrowser(url: string): Promise<void> {
  if (isTauri()) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank", "noopener");
  }
}

/** "ABCDEFGH" → "ABCD-EFGH" (más fácil de leer y tipear). */
export function formatUserCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

export class LoginError extends Error {}

export async function requestDeviceCode(
  apiUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeviceCode> {
  const res = await fetchImpl(`${normalizeApiUrl(apiUrl)}/api/auth/device/code`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new LoginError(`La API respondió ${res.status}`);
  return (await res.json()) as DeviceCode;
}

export type PollResult =
  | { state: "approved"; token: string }
  | { state: "pending"; interval: number }
  | { state: "failed"; message: string };

/** Una consulta al endpoint de token. `interval` = segundos hasta la próxima. */
export async function pollDeviceToken(
  apiUrl: string,
  deviceCode: string,
  interval: number,
  fetchImpl: typeof fetch = fetch,
): Promise<PollResult> {
  const res = await fetchImpl(`${normalizeApiUrl(apiUrl)}/api/auth/device/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: GRANT_TYPE, device_code: deviceCode, client_id: CLIENT_ID }),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
  };
  if (res.ok && body.access_token) return { state: "approved", token: body.access_token };
  switch (body.error) {
    case "authorization_pending":
      return { state: "pending", interval };
    case "slow_down":
      return { state: "pending", interval: interval + 5 };
    case "access_denied":
      return { state: "failed", message: "Cancelaste la conexión en la web." };
    case "expired_token":
      return { state: "failed", message: "El código venció. Probá de nuevo." };
    default:
      return { state: "failed", message: `No se pudo iniciar sesión (${res.status}).` };
  }
}

const authHeaders = (account: Account) => ({ authorization: `Bearer ${account.token}` });

/** Nombre del usuario del token, o null si el token ya no sirve (401). */
export async function fetchMe(
  apiUrl: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ name: string } | null> {
  const res = await fetchImpl(`${normalizeApiUrl(apiUrl)}/api/me`, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);
  return (await res.json()) as { name: string };
}

/** Slugs de las favoritas, en el orden en que se marcaron (más nuevas primero). */
export async function fetchFavorites(
  account: Account,
  fetchImpl: typeof fetch = fetch,
): Promise<string[] | null> {
  const res = await fetchImpl(`${account.apiUrl}/api/me/favorites`, {
    headers: authHeaders(account),
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);
  const body = (await res.json()) as { items: { slug: string }[] };
  return body.items.map((i) => i.slug);
}

/**
 * Marca o desmarca una favorita. Devuelve false si la sesión ya no sirve (401).
 * Lanza error si no hay conexión o la API falla.
 */
export async function setFavorite(
  account: Account,
  slug: string,
  favorite: boolean,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const res = await fetchImpl(
    `${account.apiUrl}/api/strategies/slug/${encodeURIComponent(slug)}/favorite`,
    {
      method: "POST",
      headers: { ...authHeaders(account), "content-type": "application/json" },
      body: JSON.stringify({ favorite }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (res.status === 401) return false;
  if (!res.ok) throw new Error(`La API respondió ${res.status}`);
  return true;
}

/** Cierra la sesión en la API (si falla, igual se olvida el token local). */
export async function signOut(account: Account, fetchImpl: typeof fetch = fetch): Promise<void> {
  try {
    await fetchImpl(`${account.apiUrl}/api/auth/sign-out`, {
      method: "POST",
      headers: { ...authHeaders(account), "content-type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Sin conexión: el token vence solo.
  }
}

/** Pone primero las favoritas (en el orden en que se marcaron) y deja el resto igual. */
export function favoritesFirst<T>(items: readonly T[], idOf: (item: T) => string, favs: string[]) {
  if (favs.length === 0) return [...items];
  const rank = new Map(favs.map((slug, i) => [slug, i]));
  const fav = items.filter((i) => rank.has(idOf(i)));
  fav.sort((a, b) => rank.get(idOf(a))! - rank.get(idOf(b))!);
  return [...fav, ...items.filter((i) => !rank.has(idOf(i)))];
}
