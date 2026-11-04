import { useEffect, useRef, useState } from "react";
import {
  fetchMe,
  formatUserCode,
  openInBrowser,
  pollDeviceToken,
  requestDeviceCode,
  type Account,
  type DeviceCode,
} from "../lib/account";
import { normalizeApiUrl } from "../lib/sync";

interface Props {
  apiUrl: string;
  account: Account | null;
  onLogin: (account: Account) => Promise<void>;
  onLogout: () => void;
}

type Flow =
  | { state: "idle"; error?: string }
  | { state: "requesting" }
  | { state: "waiting"; code: DeviceCode };

/** Login opcional: el overlay muestra un código y el usuario lo confirma en la web. */
export function AccountSection({ apiUrl, account, onLogin, onLogout }: Props) {
  const [flow, setFlow] = useState<Flow>({ state: "idle" });
  // Se usa para cortar el polling al cancelar o al desmontar.
  const run = useRef(0);
  useEffect(() => () => void run.current++, []);

  const base = normalizeApiUrl(apiUrl);
  const linked = account && account.apiUrl === base;

  const start = async () => {
    const id = ++run.current;
    setFlow({ state: "requesting" });
    try {
      const code = await requestDeviceCode(base);
      if (id !== run.current) return;
      setFlow({ state: "waiting", code });
      void openInBrowser(code.verification_uri_complete);

      const deadline = Date.now() + code.expires_in * 1000;
      let interval = code.interval || 5;
      while (id === run.current && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, interval * 1000));
        if (id !== run.current) return;
        const result = await pollDeviceToken(base, code.device_code, interval).catch(() => ({
          state: "pending" as const,
          interval,
        }));
        if (result.state === "pending") {
          interval = result.interval;
          continue;
        }
        if (result.state === "failed") {
          setFlow({ state: "idle", error: result.message });
          return;
        }
        const me = await fetchMe(base, result.token);
        if (!me) throw new Error("La API no aceptó el token.");
        await onLogin({ apiUrl: base, token: result.token, name: me.name });
        setFlow({ state: "idle" });
        return;
      }
      if (id === run.current)
        setFlow({ state: "idle", error: "El código venció. Probá de nuevo." });
    } catch (e) {
      if (id === run.current)
        setFlow({ state: "idle", error: e instanceof Error ? e.message : String(e) });
    }
  };

  const cancel = () => {
    run.current++;
    setFlow({ state: "idle" });
  };

  if (!base) {
    return <p className="muted">Configurá la URL de la API para poder iniciar sesión.</p>;
  }

  if (linked) {
    return (
      <>
        <p>
          Conectado como <strong>{account.name}</strong>. Tus favoritas aparecen primero (★).
        </p>
        <div className="row">
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </>
    );
  }

  if (flow.state === "waiting") {
    return (
      <>
        <p className="muted">
          Se abrió la web para confirmar. Si no se abrió, entrá a{" "}
          <code>{flow.code.verification_uri}</code> y escribí este código:
        </p>
        <p className="device-code">{formatUserCode(flow.code.user_code)}</p>
        <p className="muted">Esperando la confirmación…</p>
        <div className="row">
          <button onClick={() => void openInBrowser(flow.code.verification_uri_complete)}>
            Abrir la web de nuevo
          </button>
          <button onClick={cancel}>Cancelar</button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="muted">
        Opcional: iniciá sesión para ver tus estrategias favoritas primero en la lista.
      </p>
      {flow.state === "idle" && flow.error && <p className="error">{flow.error}</p>}
      <div className="row">
        <button
          className="primary"
          disabled={flow.state === "requesting"}
          onClick={() => void start()}
        >
          {flow.state === "requesting" ? "…" : "Iniciar sesión"}
        </button>
      </div>
    </>
  );
}
