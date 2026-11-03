export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

export const GITHUB_URL = "https://github.com/sk8erlucas/aoe2-overlay";
/** Siempre apunta al último release publicado. */
export const DOWNLOAD_URL = `${GITHUB_URL}/releases/latest`;
