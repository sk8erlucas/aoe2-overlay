"use client";

import Link from "next/link";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { winrateLabel } from "@/lib/types";

/** Winrate reportado por los usuarios y botones para sumar una partida. */
export function ResultReport({
  strategyId,
  slug,
  loggedIn,
  initial,
}: {
  strategyId: string;
  slug: string;
  loggedIn: boolean;
  initial: { games: number; wins: number };
}) {
  const [stats, setStats] = useState(initial);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const report = async (won: boolean) => {
    setError(null);
    try {
      setStats(
        await api<{ games: number; wins: number }>(`/api/strategies/${strategyId}/results`, {
          method: "POST",
          body: { won },
        }),
      );
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="card space-y-2 p-4 text-sm">
      <p className="font-bold">Winrate</p>
      <p className="text-ink/70">
        {winrateLabel(stats) ?? "Todavía no hay resultados."}{" "}
        <span className="text-xs text-ink/50">
          (lo reportan los usuarios; el overlay lo hace solo si detecta la partida)
        </span>
      </p>
      {sent ? (
        <p className="text-gold-dark">¡Gracias por reportarlo!</p>
      ) : loggedIn ? (
        <div className="flex gap-2">
          <span className="self-center text-ink/70">¿La jugaste?</span>
          <button className="btn btn-gold text-xs" onClick={() => void report(true)}>
            Gané
          </button>
          <button className="btn btn-ghost text-xs" onClick={() => void report(false)}>
            Perdí
          </button>
        </div>
      ) : (
        <p className="text-ink/70">
          <Link className="text-red underline" href={`/ingresar?next=/estrategias/${slug}`}>
            Ingresá
          </Link>{" "}
          para reportar tus partidas.
        </p>
      )}
      {error && (
        <p className="text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
