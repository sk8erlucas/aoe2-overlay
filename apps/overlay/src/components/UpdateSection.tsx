import { useState } from "react";
import type { AvailableUpdate } from "../lib/updater";

/** Aviso de versión nueva en Ajustes. Instalar cierra y reabre el overlay. */
export function UpdateSection({ update }: { update: AvailableUpdate }) {
  const [state, setState] = useState<"idle" | "installing" | "error">("idle");
  const [progress, setProgress] = useState<number | null>(null);

  const install = async () => {
    setState("installing");
    try {
      await update.install(setProgress);
    } catch (e) {
      console.warn("Falló la actualización", e);
      setState("error");
    }
  };

  return (
    <div className="update">
      <p>
        Hay una versión nueva: <strong>{update.version}</strong>
      </p>
      {state === "error" && (
        <p className="error">No se pudo actualizar. Probá de nuevo o bajala desde la web.</p>
      )}
      <div className="row">
        <button
          className="primary"
          disabled={state === "installing"}
          onClick={() => void install()}
        >
          {state === "installing"
            ? progress === null
              ? "Descargando…"
              : `Descargando… ${Math.round(progress * 100)}%`
            : "Actualizar y reiniciar"}
        </button>
      </div>
      <p className="muted">
        No la instales en medio de una partida: el overlay se cierra un momento.
      </p>
    </div>
  );
}
