"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";

/** "Eliminar mi cuenta": pide la contraseña y borra la cuenta en la API. */
export function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm("¿Seguro? Tu cuenta se borra para siempre.")) return;
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/delete-user", { method: "POST", body: { password } });
      window.location.assign("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? "La contraseña no es correcta."
          : "No se pudo eliminar la cuenta. Probá de nuevo en un rato.",
      );
      setBusy(false);
    }
  }

  return (
    <details className="card p-5 text-sm">
      <summary className="label cursor-pointer text-red">Eliminar mi cuenta</summary>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <p className="text-ink/70">
          Se borran tu cuenta, tus votos y tus favoritas. Las estrategias que publicaste quedan en
          el catálogo sin autor.
        </p>
        <label className="block space-y-1">
          <span className="text-ink/70">Confirmá con tu contraseña</span>
          <input
            className="w-full rounded border border-ink/20 bg-white px-3 py-2"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="text-red" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-red text-xs" type="submit" disabled={busy || !password}>
          {busy ? "Eliminando…" : "Eliminar mi cuenta"}
        </button>
      </form>
    </details>
  );
}
