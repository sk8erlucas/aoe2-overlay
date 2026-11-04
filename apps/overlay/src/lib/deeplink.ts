/**
 * Links `ageoverlay://` que abre la web ("Abrir en el overlay").
 *
 *   ageoverlay://strategy/<slug>  → elegir esa estrategia
 */
import { isTauri } from "@tauri-apps/api/core";

export const SCHEME = "ageoverlay";

export type DeepLink = { type: "strategy"; slug: string };

const SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/i;

export function parseDeepLink(url: string): DeepLink | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== `${SCHEME}:`) return null;
  // En `ageoverlay://strategy/x`, "strategy" es el host y "/x" el path.
  const parts = [parsed.hostname, ...parsed.pathname.split("/")].filter(Boolean);
  const [kind, raw] = parts;
  if (kind !== "strategy" || !raw || parts.length !== 2) return null;
  const slug = decodeURIComponent(raw);
  return SLUG.test(slug) ? { type: "strategy", slug } : null;
}

/** Escucha los links: el que abrió la app (si hay) y los que lleguen con la app abierta. */
export async function onDeepLink(handler: (link: DeepLink) => void): Promise<() => void> {
  if (!isTauri()) return () => {};
  const { getCurrent, onOpenUrl } = await import("@tauri-apps/plugin-deep-link");
  const handle = (urls: string[] | null) => {
    for (const url of urls ?? []) {
      const link = parseDeepLink(url);
      if (link) handler(link);
    }
  };
  handle(await getCurrent());
  return onOpenUrl(handle);
}
