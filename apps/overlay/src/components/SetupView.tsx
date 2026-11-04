import { CIVS, MAPS, mapTypeOf } from "@age-overlay/game-data";
import { POSITIONS, suggest, type Position } from "@age-overlay/shared";
import { useMemo, useState } from "react";
import type { Selection } from "../lib/settings";
import type { LoadedStrategy } from "../lib/strategies";
import type { SyncStatus } from "../lib/sync";

const POSITION_LABELS: Record<Position, string> = {
  "1v1": "1 contra 1",
  flank: "Flanco",
  pocket: "Bolsillo (pocket)",
};

const civsSorted = [...CIVS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));
const mapsSorted = [...MAPS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function timeAgo(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} días`;
}

function SyncLine({ status, count }: { status: SyncStatus; count: number }) {
  if (status.state === "syncing") return <p className="sync-status">Sincronizando estrategias…</p>;
  if (status.state === "ok")
    return (
      <p className="sync-status">
        ✓ {count} estrategias · sincronizado {timeAgo(status.syncedAt)}
      </p>
    );
  if (status.state === "offline")
    return (
      <p className="sync-status offline" title={status.message}>
        Sin conexión: usando {count} estrategias guardadas
        {status.syncedAt ? ` (${timeAgo(status.syncedAt)})` : ""}
      </p>
    );
  return <p className="sync-status">{count} estrategias</p>;
}

interface Props {
  strategies: readonly LoadedStrategy[];
  syncStatus: SyncStatus;
  selection: Selection;
  onChange: (selection: Selection) => void;
  onPlay: () => void;
}

/** Pantalla previa a la partida: elegir mapa, civs y posición, y ver sugerencias. */
export function SetupView({ strategies, syncStatus, selection, onChange, onPlay }: Props) {
  const [query, setQuery] = useState("");
  const set = <K extends keyof Selection>(key: K, value: Selection[K]) =>
    onChange({ ...selection, [key]: value || undefined });

  const suggestions = useMemo(() => {
    const mapType = selection.map ? mapTypeOf(selection.map) : undefined;
    return suggest(
      strategies,
      {
        civ: selection.civ,
        vsCiv: selection.vsCiv,
        map: selection.map,
        mapType,
        position: selection.position,
      },
      { limit: 50, getVotes: (s) => s.score ?? 0 },
    );
  }, [strategies, selection.civ, selection.vsCiv, selection.map, selection.position]);

  // Con texto en el buscador se busca en todas por nombre (ignora los filtros).
  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return suggestions;
    return strategies
      .filter((s) => normalize(s.name).includes(q))
      .slice(0, 50)
      .map((strategy) => ({ strategy, score: 0, reasons: ["búsqueda"] }));
  }, [query, strategies, suggestions]);

  const chosen = strategies.find((s) => s.id === selection.strategyId);

  return (
    <div className="setup">
      <SyncLine status={syncStatus} count={strategies.length} />
      <div className="fields">
        <label>
          Mapa
          <select value={selection.map ?? ""} onChange={(e) => set("map", e.target.value)}>
            <option value="">— Cualquiera —</option>
            {mapsSorted.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name.es}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mi civilización
          <select value={selection.civ ?? ""} onChange={(e) => set("civ", e.target.value)}>
            <option value="">— Cualquiera —</option>
            {civsSorted.map((c) => (
              <option key={c.id} value={c.name.en}>
                {c.name.es}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rival
          <select value={selection.vsCiv ?? ""} onChange={(e) => set("vsCiv", e.target.value)}>
            <option value="">— No sé —</option>
            {civsSorted.map((c) => (
              <option key={c.id} value={c.name.en}>
                {c.name.es}
              </option>
            ))}
          </select>
        </label>
        <label>
          Posición
          <select
            value={selection.position ?? ""}
            onChange={(e) => set("position", e.target.value as Position)}
          >
            <option value="">— Cualquiera —</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {POSITION_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>{query.trim() ? "Resultados" : "Sugerencias"}</h3>
      <input
        className="search"
        placeholder="Buscar por nombre…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length === 0 ? (
        <p className="muted">No hay estrategias para esa combinación.</p>
      ) : (
        <ul className="suggestions">
          {results.map(({ strategy: s, reasons }) => (
            <li key={s.id}>
              <button
                className={s.id === selection.strategyId ? "selected" : ""}
                onClick={() => set("strategyId", s.id)}
              >
                <span className="s-name">
                  {s.name}
                  {s.verified && <span className="badge">✔</span>}
                  {(s.score ?? 0) > 0 && <span className="badge">▲ {s.score}</span>}
                </span>
                <span className="s-meta">
                  {reasons.join(" · ") || "general"} · {s.build_order.length} pasos · {s.author}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {chosen?.description && <p className="description">{chosen.description}</p>}

      <button className="primary play" disabled={!chosen} onClick={onPlay}>
        ▶ Jugar con esta estrategia
      </button>
    </div>
  );
}
