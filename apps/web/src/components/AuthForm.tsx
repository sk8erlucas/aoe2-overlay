"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { safeNext } from "@/lib/safe-next";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const register = mode === "register";
  // Discord aparece solo si la API lo tiene configurado.
  const [discord, setDiscord] = useState(false);
  useEffect(() => {
    api<{ discord: boolean }>("/api/login-options")
      .then((o) => setDiscord(o.discord))
      .catch(() => setDiscord(false));
  }, []);

  const withDiscord = async () => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>("/api/auth/sign-in/social", {
        method: "POST",
        body: {
          provider: "discord",
          callbackURL: `${window.location.origin}${safeNext(params.get("next"))}`,
          errorCallbackURL: `${window.location.origin}/ingresar`,
        },
      });
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (register && data.password !== data.password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api(register ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email", {
        method: "POST",
        body: register
          ? { name: data.name, email: data.email, password: data.password }
          : { email: data.email, password: data.password },
      });
      // Navegación completa: así el header (layout en caché) muestra la sesión nueva.
      window.location.assign(safeNext(params.get("next")));
    } catch (err) {
      const msg = errorMessage(err);
      setError(
        /invalid email or password/i.test(msg)
          ? "Email o contraseña incorrectos"
          : /already exists/i.test(msg)
            ? "Ya existe una cuenta con ese email"
            : msg,
      );
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="font-display text-4xl tracking-wide">
        {register ? "CREAR CUENTA" : "INGRESAR"}
      </h1>
      {register && (
        <label className="block text-sm">
          <span className="label text-xs text-ink/60">Nombre o nick</span>
          <input
            className="field mt-1"
            name="name"
            required
            maxLength={40}
            autoComplete="nickname"
          />
        </label>
      )}
      <label className="block text-sm">
        <span className="label text-xs text-ink/60">Email</span>
        <input className="field mt-1" name="email" type="email" required autoComplete="email" />
      </label>
      <label className="block text-sm">
        <span className="label text-xs text-ink/60">Contraseña</span>
        <input
          className="field mt-1"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={register ? "new-password" : "current-password"}
        />
      </label>
      {register && (
        <label className="block text-sm">
          <span className="label text-xs text-ink/60">Repetir contraseña</span>
          <input
            className="field mt-1"
            name="password2"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
      )}
      {error && (
        <p className="text-sm text-red" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-red w-full" disabled={busy}>
        {busy ? "…" : register ? "Crear cuenta" : "Ingresar"}
      </button>
      {discord && (
        <button
          type="button"
          className="btn btn-ghost w-full"
          disabled={busy}
          onClick={() => void withDiscord()}
        >
          {register ? "Crear cuenta con Discord" : "Ingresar con Discord"}
        </button>
      )}
      <p className="text-center text-sm text-ink/70">
        {register ? (
          <>
            ¿Ya tenés cuenta?{" "}
            <Link className="text-red underline" href="/ingresar">
              Ingresá
            </Link>
          </>
        ) : (
          <>
            ¿No tenés cuenta?{" "}
            <Link className="text-red underline" href="/registro">
              Creala gratis
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
