import { useState } from "react";
import { useT } from "../lib/i18n";
import type { AvailableUpdate } from "../lib/updater";

/** Aviso de versión nueva en Ajustes. Instalar cierra y reabre el overlay. */
export function UpdateSection({ update }: { update: AvailableUpdate }) {
  const t = useT();
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
        {t("update.available")} <strong>{update.version}</strong>
      </p>
      {state === "error" && <p className="error">{t("update.error")}</p>}
      <div className="row">
        <button
          className="primary"
          disabled={state === "installing"}
          onClick={() => void install()}
        >
          {state === "installing"
            ? progress === null
              ? t("update.downloading")
              : `${t("update.downloading")} ${Math.round(progress * 100)}%`
            : t("update.install")}
        </button>
      </div>
      <p className="muted">{t("update.notInGame")}</p>
    </div>
  );
}
