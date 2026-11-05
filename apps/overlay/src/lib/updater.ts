/**
 * Actualizaciones automáticas (tauri-plugin-updater).
 *
 * El release de GitHub publica `latest.json` con la versión nueva y la firma de cada
 * instalador; el overlay solo instala si la firma coincide con la clave pública de
 * tauri.conf.json. En Windows corre el instalador en modo "passive" y la app se cierra.
 */
import { isTauri } from "@tauri-apps/api/core";

/** Cada cuánto se vuelve a buscar con la app abierta. */
export const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export interface AvailableUpdate {
  version: string;
  notes?: string;
  install: (onProgress: (fraction: number | null) => void) => Promise<void>;
}

/** Devuelve la actualización disponible, o null si no hay (o no se pudo consultar). */
export async function checkForUpdate(): Promise<AvailableUpdate | null> {
  if (!isTauri()) return null;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check({ timeout: 20_000 });
    if (!update) return null;
    return {
      version: update.version,
      notes: update.body,
      async install(onProgress) {
        let total = 0;
        let done = 0;
        await update.downloadAndInstall((event) => {
          if (event.event === "Started") total = event.data.contentLength ?? 0;
          if (event.event === "Progress") {
            done += event.data.chunkLength;
            onProgress(total ? done / total : null);
          }
        });
        // En Windows el instalador ya cerró la app; en otros sistemas se reinicia acá.
        const { relaunch } = await import("@tauri-apps/plugin-process");
        await relaunch();
      },
    };
  } catch (e) {
    console.warn("No se pudo buscar actualizaciones", e);
    return null;
  }
}
