export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

/** URL pública de la web, para el sitemap y las imágenes al compartir. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aoe2overlay.sitemaster.com.ar"
).replace(/\/$/, "");

/** Proyecto hermano. Los links llevan UTM para que su web sepa que la visita vino de acá. */
export const REPLAYS_URL = "https://aoe2replays.sitemaster.com.ar";
export const REPLAYS_REPO = "https://github.com/sk8erlucas/aoe2-replays";
export function replaysLink(path: string, placement = "home"): string {
  return `${REPLAYS_URL}${path}?utm_source=aoe2-overlay&utm_medium=referral&utm_campaign=${placement}`;
}

export const GITHUB_URL = "https://github.com/sk8erlucas/aoe2-overlay";
/** Siempre apunta al último release publicado. */
export const DOWNLOAD_URL = `${GITHUB_URL}/releases/latest`;
