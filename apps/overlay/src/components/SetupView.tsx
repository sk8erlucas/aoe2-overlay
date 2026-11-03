import { CIVS, MAPS, mapTypeOf } from "@age-overlay/game-data";
import { POSITIONS, suggest, type Position } from "@age-overlay/shared";
import { useMemo } from "react";
import type { Selection } from "../lib/settings";
import { BUNDLED_STRATEGIES } from "../lib/strategies";

const POSITION_LABELS: Record<Position, string> = {
  "1v1": "1 contra 1",
  flank: "Flanco",
  pocket: "Bolsillo (pocket)",
};

const civsSorted = [...CIVS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));
const mapsSorted = [...MAPS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));

interface Props {
  selection: Selection;
  onChange: (selection: Selection) => void;
  onPlay: () => void;
}

/** Pantalla previa a la partida: elegir mapa, civs y posición, y ver sugerencias. */
export function SetupView({ selection, onChange, onPlay }: Props) {
  const set = <K extends keyof Selection>(key: K, value: Selection[K]) =>
    onChange({ ...selection, [key]: value || undefined });

  const suggestions = useMemo(() => {
    const mapType = selection.map ? mapTypeOf(selection.map) : undefined;
    return suggest(
      BUNDLED_STRATEGIES,
      {
        civ: selection.civ,
        vsCiv: selection.vsCiv,
        map: selection.map,
        mapType,
        position: selection.position,
      },
      { limit: 50 },
    );
  }, [selection.civ, selection.vsCiv, selection.map, selection.position]);

  const chosen = BUNDLED_STRATEGIES.find((s) => s.id === selection.strategyId);

  return (
    <div className="setup">
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

      <h3>Sugerencias</h3>
      {suggestions.length === 0 ? (
        <p className="muted">No hay estrategias para esa combinación.</p>
      ) : (
        <ul className="suggestions">
          {suggestions.map(({ strategy, reasons }) => {
            const s = strategy as (typeof BUNDLED_STRATEGIES)[number];
            return (
              <li key={s.id}>
                <button
                  className={s.id === selection.strategyId ? "selected" : ""}
                  onClick={() => set("strategyId", s.id)}
                >
                  <span className="s-name">{s.name}</span>
                  <span className="s-meta">
                    {reasons.join(" · ") || "general"} · {s.build_order.length} pasos
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {chosen?.description && <p className="description">{chosen.description}</p>}

      <button className="primary play" disabled={!chosen} onClick={onPlay}>
        ▶ Jugar con esta estrategia
      </button>
    </div>
  );
}
