"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Comment } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

/** Comentarios de una estrategia: se cargan en el navegador (no frenan la página). */
export function Comments({
  strategyId,
  slug,
  loggedIn,
}: {
  strategyId: string;
  slug: string;
  loggedIn: boolean;
}) {
  const [items, setItems] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Comment[] }>(`/api/strategies/${strategyId}/comments`)
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));
  }, [strategyId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const c = await api<Comment>(`/api/strategies/${strategyId}/comments`, {
        method: "POST",
        body: { body: text },
      });
      setItems((prev) => [...(prev ?? []), c]);
      setText("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("¿Borrar el comentario?")) return;
    try {
      await api(`/api/comments/${id}`, { method: "DELETE" });
      setItems((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="label text-sm text-red">
        Comentarios{items && items.length > 0 ? ` · ${items.length}` : ""}
      </h2>
      {items === null ? (
        <p className="text-sm text-ink/50">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-ink/60">Todavía nadie comentó. ¿La probaste?</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="card p-4 text-sm">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs text-ink/60">
                <span>
                  <strong className="text-ink">{c.author.name}</strong> ·{" "}
                  {dateFormat.format(new Date(c.createdAt))}
                </span>
                {c.canDelete && (
                  <button className="hover:text-red" onClick={() => void remove(c.id)}>
                    Borrar
                  </button>
                )}
              </div>
              <p className="whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      {loggedIn ? (
        <form className="space-y-2" onSubmit={send}>
          <label className="block text-sm">
            <span className="sr-only">Tu comentario</span>
            <textarea
              className="field min-h-24"
              maxLength={1000}
              placeholder="Contá cómo te fue, qué cambiarías o contra qué funciona"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          {error && (
            <p className="text-sm text-red" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-red text-xs" disabled={busy || !text.trim()}>
            {busy ? "Enviando…" : "Comentar"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink/70">
          <Link className="text-red underline" href={`/ingresar?next=/estrategias/${slug}`}>
            Ingresá
          </Link>{" "}
          para comentar.
        </p>
      )}
    </section>
  );
}
