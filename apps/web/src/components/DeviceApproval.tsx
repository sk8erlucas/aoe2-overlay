"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";

type Step = "enter" | "confirm" | "approved" | "denied";

/** Formato del código que muestra el overlay: ABCD-EFGH. */
const pretty = (code: string) => {
  const c = code.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
};

export function DeviceApproval({
  initialCode,
  userName,
}: {
  initialCode: string;
  userName: string;
}) {
  const [code, setCode] = useState(pretty(initialCode));
  const [step, setStep] = useState<Step>("enter");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const userCode = code.replace(/[^a-z0-9]/gi, "").toUpperCase();

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = errorMessage(e);
      setError(
        /invalid user code/i.test(msg)
          ? "Ese código no existe. Revisá que sea el que muestra el overlay."
          : /expired/i.test(msg)
            ? "El código venció. Pedí uno nuevo desde el overlay."
            : /already processed/i.test(msg)
              ? "Ese código ya se usó."
              : msg,
      );
    } finally {
      setBusy(false);
    }
  };

  // GET /device asocia el código a la sesión actual; después se aprueba o rechaza.
  const check = () =>
    run(async () => {
      const r = await api<{ status: string }>(
        `/api/auth/device?user_code=${encodeURIComponent(userCode)}`,
      );
      if (r.status !== "pending") throw new Error("already processed");
      setStep("confirm");
    });

  const decide = (approve: boolean) =>
    run(async () => {
      await api(`/api/auth/device/${approve ? "approve" : "deny"}`, {
        method: "POST",
        body: { userCode },
      });
      setStep(approve ? "approved" : "denied");
    });

  return (
    <div className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="font-display text-4xl tracking-wide">CONECTAR EL OVERLAY</h1>

      {step === "enter" && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void check();
          }}
        >
          <p className="text-sm text-ink/70">
            Escribí el código que te muestra el overlay en <strong>Ajustes → Cuenta</strong>.
          </p>
          <input
            className="field text-center font-mono text-2xl tracking-[0.3em] uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ABCD-EFGH"
            autoComplete="off"
            spellCheck={false}
            maxLength={12}
            required
            aria-label="Código del overlay"
          />
          <button className="btn btn-red w-full" disabled={busy || userCode.length < 8}>
            {busy ? "…" : "Continuar"}
          </button>
        </form>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <p className="text-ink/80">
            ¿Conectar el overlay de esta PC con tu cuenta <strong>{userName}</strong>? Va a poder
            ver tus favoritas.
          </p>
          <p className="text-center font-mono text-2xl tracking-[0.3em]">{pretty(userCode)}</p>
          <p className="text-xs text-ink/60">
            Confirmá solo si este código lo ves en tu propio overlay. Si alguien te lo pasó,
            cancelá.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-red flex-1" disabled={busy} onClick={() => decide(true)}>
              Conectar
            </button>
            <button className="btn btn-ghost flex-1" disabled={busy} onClick={() => decide(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {step === "approved" && (
        <p className="text-ink/80">
          ✓ Listo. Volvé al overlay: en unos segundos va a aparecer tu cuenta. Ya podés cerrar esta
          pestaña.
        </p>
      )}
      {step === "denied" && (
        <p className="text-ink/80">Cancelado. El overlay no quedó conectado.</p>
      )}

      {error && (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
