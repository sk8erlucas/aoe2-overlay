import "server-only";
import { cookies } from "next/headers";
import { api, ApiError, type ApiOptions } from "./api";
import type { Me } from "./types";

/** Llama a la API desde un Server Component reenviando la cookie de sesión del usuario. */
export async function serverApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const cookie = (await cookies()).toString();
  return api<T>(path, { ...options, cookie: cookie || undefined });
}

/** Usuario logueado o null (también null si la API no responde). */
export async function getMe(): Promise<Me | null> {
  try {
    return await serverApi<Me>("/api/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    return null;
  }
}
