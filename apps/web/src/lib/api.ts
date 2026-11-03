/**
 * Cliente de la API. Funciona en el navegador (envía la cookie de sesión con
 * `credentials: "include"`) y en el servidor (reenviando la cookie a mano).
 */
import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

type QueryValue = string | number | boolean | undefined | null;

/** { civ: "Malay", page: 2, q: "" } → "?civ=Malay&page=2" (omite vacíos). */
export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Cookie a reenviar cuando se llama desde el servidor. */
  cookie?: string;
  next?: { revalidate?: number | false; tags?: string[] };
}

export async function api<T>(path: string, { body, cookie, headers, ...init }: ApiOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: init.cache ?? (init.next ? undefined : "no-store"),
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : undefined;
  if (!res.ok) {
    const err = (data ?? {}) as { error?: string; message?: string; issues?: ApiError["issues"] };
    throw new ApiError(res.status, err.error ?? err.message ?? `Error ${res.status}`, err.issues);
  }
  return data as T;
}

/** Mensaje legible para mostrar en un formulario. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.issues?.length) {
      return `${e.message}: ${e.issues.map((i) => `${i.path || "(raíz)"} ${i.message}`).join("; ")}`;
    }
    return e.message;
  }
  if (e instanceof TypeError) return "No se pudo conectar con la API. ¿Está corriendo?";
  return e instanceof Error ? e.message : "Error inesperado";
}
