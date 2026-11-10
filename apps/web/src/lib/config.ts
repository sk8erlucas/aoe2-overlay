export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

/** URL pública de la web, para el sitemap y las imágenes al compartir. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aoe2overlay.sitemaster.com.ar"
).replace(/\/$/, "");

export const GITHUB_URL = "https://github.com/sk8erlucas/aoe2-overlay";
/** Siempre apunta al último release publicado. */
export const DOWNLOAD_URL = `${GITHUB_URL}/releases/latest`;
