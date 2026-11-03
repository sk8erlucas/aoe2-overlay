"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { StrategyDetail } from "@/lib/types";

export function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `${name}.json` });
  a.click();
  URL.revokeObjectURL(url);
}

export function StrategyActions({ s, loggedIn }: { s: StrategyDetail; loggedIn: boolean }) {
  const router = useRouter();
  const [score, setScore] = useState(s.score);
  const [myVote, setMyVote] = useState(s.myVote);
  const [fav, setFav] = useState(s.isFavorite);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const needLogin = () => {
    router.push(`/ingresar?next=/estrategias/${s.slug}`);
  };

  const run = async (fn: () => Promise<void>) => {
    if (!loggedIn) return needLogin();
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const vote = (value: 1 | -1) =>
    run(async () => {
      const next = myVote === value ? 0 : value;
      const r = await api<{ score: number; myVote: number }>(`/api/strategies/${s.id}/vote`, {
        method: "POST",
        body: { value: next },
      });
      setScore(r.score);
      setMyVote(r.myVote);
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-full border border-ink/20">
          <button
            className={`px-3 py-1.5 ${myVote === 1 ? "bg-gold" : "hover:bg-ink/5"}`}
            disabled={busy}
            onClick={() => vote(1)}
            aria-label="Votar a favor"
          >
            ▲
          </button>
          <span className="min-w-8 text-center font-bold tabular-nums">{score}</span>
          <button
            className={`px-3 py-1.5 ${myVote === -1 ? "bg-red text-cream" : "hover:bg-ink/5"}`}
            disabled={busy}
            onClick={() => vote(-1)}
            aria-label="Votar en contra"
          >
            ▼
          </button>
        </div>
        <button
          className={`btn text-xs ${fav ? "btn-gold" : "btn-ghost"}`}
          disabled={busy}
          onClick={() =>
            run(async () => {
              const r = await api<{ isFavorite: boolean }>(`/api/strategies/${s.id}/favorite`, {
                method: "POST",
                body: { favorite: !fav },
              });
              setFav(r.isFavorite);
            })
          }
        >
          {fav ? "★ Favorita" : "☆ Favorita"}
        </button>
        <button className="btn btn-ghost text-xs" onClick={() => downloadJson(s.slug, s.data)}>
          Exportar JSON
        </button>
        {s.canEdit && (
          <>
            <Link className="btn btn-ghost text-xs" href={`/estrategias/${s.slug}/editar`}>
              Editar
            </Link>
            <button
              className="btn btn-ghost text-xs text-red"
              disabled={busy}
              onClick={() => {
                if (!confirm(`¿Borrar "${s.name}"? No se puede deshacer.`)) return;
                void run(async () => {
                  await api(`/api/strategies/${s.id}`, { method: "DELETE" });
                  router.push("/perfil");
                  router.refresh();
                });
              }}
            >
              Borrar
            </button>
          </>
        )}
        <button
          className="btn btn-ghost text-xs text-ink/60"
          disabled={busy}
          onClick={() => {
            if (!loggedIn) return needLogin();
            const reason = prompt(
              "¿Por qué reportás esta estrategia? (spam, contenido ofensivo, copia sin crédito…)",
            );
            if (!reason?.trim()) return;
            void run(async () => {
              await api(`/api/strategies/${s.id}/report`, { method: "POST", body: { reason } });
              setMsg("Gracias, un moderador lo va a revisar.");
            });
          }}
        >
          Reportar
        </button>
      </div>
      {msg && <p className="text-sm text-red">{msg}</p>}
    </div>
  );
}
