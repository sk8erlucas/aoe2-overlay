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
import { useT } from "../lib/i18n";
import { API_URL } from "../lib/sync";

interface Props {
  account: Account | null;
  onLogin: (account: Account) => Promise<void>;
  onLogout: () => void;
}

type Flow =
  | { state: "idle"; error?: string }
  | { state: "requesting" }
  | { state: "waiting"; code: DeviceCode };

/** Login opcional: el overlay muestra un código y el usuario lo confirma en la web. */
export function AccountSection({ account, onLogin, onLogout }: Props) {
  const [flow, setFlow] = useState<Flow>({ state: "idle" });
  // Se usa para cortar el polling al cancelar o al desmontar.
  const t = useT();
  const run = useRef(0);
  useEffect(() => () => void run.current++, []);

  const base = API_URL;

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
        if (!me) throw new Error(t("account.tokenRejected"));
        await onLogin({ apiUrl: base, token: result.token, name: me.name });
        setFlow({ state: "idle" });
        return;
      }
      if (id === run.current) setFlow({ state: "idle", error: t("account.expired") });
    } catch (e) {
      if (id === run.current)
        setFlow({ state: "idle", error: e instanceof Error ? e.message : String(e) });
    }
  };

  const cancel = () => {
    run.current++;
    setFlow({ state: "idle" });
  };

  if (account) {
    return (
      <>
        <p>
          {t("account.connected", { name: account.name })} {t("account.connectedHelp")}
        </p>
        <div className="row">
          <button onClick={onLogout}>{t("account.logout")}</button>
        </div>
      </>
    );
  }

  if (flow.state === "waiting") {
    return (
      <>
        <p className="muted">
          {t("account.waitingOpened")} <code>{flow.code.verification_uri}</code>{" "}
          {t("account.waitingCode")}
        </p>
        <p className="device-code">{formatUserCode(flow.code.user_code)}</p>
        <p className="muted">{t("account.waiting")}</p>
        <div className="row">
          <button onClick={() => void openInBrowser(flow.code.verification_uri_complete)}>
            {t("account.reopen")}
          </button>
          <button onClick={cancel}>{t("account.cancel")}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="muted">{t("account.optional")}</p>
      {flow.state === "idle" && flow.error && <p className="error">{flow.error}</p>}
      <div className="row">
        <button
          className="primary"
          disabled={flow.state === "requesting"}
          onClick={() => void start()}
        >
          {flow.state === "requesting" ? "…" : t("account.login")}
        </button>
      </div>
    </>
  );
}
