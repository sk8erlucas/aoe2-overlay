import { CIVS, MAPS, mapTypeOf } from "@age-overlay/game-data";
import {
  POSITIONS,
  estimateStepTimes,
  formatClock,
  populationOf,
  suggest,
  type Position,
} from "@age-overlay/shared";
import { Fragment, useMemo, useState } from "react";
import { favoritesFirst } from "../lib/account";
import { useLang, useT, type T, type TKey } from "../lib/i18n";
import type { Selection } from "../lib/settings";
import type { LoadedStrategy } from "../lib/strategies";
import type { SyncStatus } from "../lib/sync";
import { Resources, StepNotes } from "./StepCard";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Motivos de la sugerencia (vienen en español de packages/shared). */
const REASONS_EN: Record<string, string> = {
  genérica: "generic",
  civ: "civ",
  mapa: "map",
  "tipo de mapa": "map type",
  rival: "opponent",
  posición: "position",
  búsqueda: "search",
};

function timeAgo(iso: string, t: T): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return t("ago.now");
  if (min < 60) return t("ago.min", { n: min });
  const h = Math.round(min / 60);
  return h < 24 ? t("ago.hours", { n: h }) : t("ago.days", { n: Math.round(h / 24) });
}

/** Lista completa de pasos de una estrategia, para mirarla antes de jugar. */
function StrategyPreview({ strategy }: { strategy: LoadedStrategy }) {
  const t = useT();
  const times = useMemo(() => estimateStepTimes(strategy.build_order), [strategy]);
  return (
    <ol className="preview">
      {strategy.build_order.map((step, i) => (
        <Fragment key={i}>
          {step.age !== strategy.build_order[i - 1]?.age && (
            <li className="preview-age">{t(`ageFull.${step.age}` as TKey)}</li>
          )}
          <li className="preview-step">
            <div className="preview-head">
              <span className="preview-time">{formatClock(times[i] ?? 0)}</span>
              <span>👥 {populationOf(step)}</span>
              <Resources step={step} />
            </div>
            <StepNotes step={step} />
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

function SyncLine({ status, count }: { status: SyncStatus; count: number }) {
  const t = useT();
  if (status.state === "syncing") return <p className="sync-status">{t("sync.syncing")}</p>;
  if (status.state === "ok")
    return (
      <p className="sync-status">{t("sync.ok", { count, ago: timeAgo(status.syncedAt, t) })}</p>
    );
  if (status.state === "offline")
    return (
      <p className="sync-status offline" title={status.message}>
        {t("sync.offline", { count })}
        {status.syncedAt ? ` (${timeAgo(status.syncedAt, t)})` : ""}
      </p>
    );
  return <p className="sync-status">{t("sync.idle", { count })}</p>;
}

interface Props {
  strategies: readonly LoadedStrategy[];
  /** Slugs de las favoritas del usuario (vacío sin cuenta). */
  favorites: string[];
  loggedIn: boolean;
  /** Sin sesión, lleva a Ajustes → Cuenta. */
  onToggleFavorite: (slug: string) => void;
  syncStatus: SyncStatus;
  selection: Selection;
  onChange: (selection: Selection) => void;
  onPlay: () => void;
  /** Estado de la detección automática (null si está apagada). */
  detectLine?: string | null;
}

/** Pantalla previa a la partida: elegir mapa, civs y posición, y ver sugerencias. */
export function SetupView({
  strategies,
  favorites,
  loggedIn,
  onToggleFavorite,
  syncStatus,
  selection,
  onChange,
  onPlay,
  detectLine,
}: Props) {
  const t = useT();
  const lang = useLang();
  const civsSorted = useMemo(
    () => [...CIVS].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang)),
    [lang],
  );
  const mapsSorted = useMemo(
    () => [...MAPS].sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang)),
    [lang],
  );
  const reason = (r: string) => (lang === "en" ? (REASONS_EN[r] ?? r) : r);
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string>();
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
      // Sin recortar acá: las favoritas se suben antes de quedarse con 50.
      { limit: strategies.length, getVotes: (s) => s.score ?? 0 },
    );
  }, [strategies, selection.civ, selection.vsCiv, selection.map, selection.position]);

  // Con texto en el buscador se busca en todas por nombre (ignora los filtros).
  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = q
      ? strategies
          .filter((s) => normalize(s.name).includes(q))
          .map((strategy) => ({ strategy, score: 0, reasons: ["búsqueda"] }))
      : suggestions;
    return favoritesFirst(list, (r) => r.strategy.id, favorites).slice(0, 50);
  }, [query, strategies, suggestions, favorites]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const chosen = strategies.find((s) => s.id === selection.strategyId);

  return (
    <div className="setup">
      <SyncLine status={syncStatus} count={strategies.length} />
      {detectLine && <p className="sync-status">{detectLine}</p>}
      <div className="fields">
        <label>
          {t("setup.map")}
          <select value={selection.map ?? ""} onChange={(e) => set("map", e.target.value)}>
            <option value="">{t("setup.any")}</option>
            {mapsSorted.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("setup.civ")}
          <select value={selection.civ ?? ""} onChange={(e) => set("civ", e.target.value)}>
            <option value="">{t("setup.any")}</option>
            {civsSorted.map((c) => (
              <option key={c.id} value={c.name.en}>
                {c.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("setup.vsCiv")}
          <select value={selection.vsCiv ?? ""} onChange={(e) => set("vsCiv", e.target.value)}>
            <option value="">{t("setup.dontKnow")}</option>
            {civsSorted.map((c) => (
              <option key={c.id} value={c.name.en}>
                {c.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("setup.position")}
          <select
            value={selection.position ?? ""}
            onChange={(e) => set("position", e.target.value as Position)}
          >
            <option value="">{t("setup.any")}</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {t(`position.${p}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>{query.trim() ? t("setup.results") : t("setup.suggestions")}</h3>
      <input
        className="search"
        placeholder={t("setup.search")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length === 0 ? (
        <p className="muted">{t("setup.none")}</p>
      ) : (
        <ul className="suggestions">
          {results.map(({ strategy: s, reasons }) => (
            <li key={s.id}>
              <button
                className={`star ${favSet.has(s.id) ? "on" : ""}`}
                aria-pressed={favSet.has(s.id)}
                title={
                  !loggedIn
                    ? t("setup.favLogin")
                    : favSet.has(s.id)
                      ? t("setup.favRemove")
                      : t("setup.favAdd")
                }
                onClick={() => onToggleFavorite(s.id)}
              >
                {favSet.has(s.id) ? "★" : "☆"}
              </button>
              <button
                className={`pick ${s.id === selection.strategyId ? "selected" : ""}`}
                onClick={() => set("strategyId", s.id)}
              >
                <span className="s-name">
                  {s.name}
                  {s.verified && <span className="badge">✔</span>}
                  {(s.score ?? 0) > 0 && <span className="badge">▲ {s.score}</span>}
                </span>
                <span className="s-meta">
                  {reasons.map(reason).join(" · ") || t("setup.general")} ·{" "}
                  {t("setup.steps", { n: s.build_order.length })} · {s.author}
                </span>
              </button>
              <button
                className={`row-action ${previewId === s.id ? "on" : ""}`}
                aria-pressed={previewId === s.id}
                title={previewId === s.id ? t("setup.previewHide") : t("setup.previewShow")}
                onClick={() => setPreviewId(previewId === s.id ? undefined : s.id)}
              >
                👁
              </button>
              <button
                className="row-action play-row"
                title={t("setup.playThis", { name: s.name })}
                onClick={() => {
                  onChange({ ...selection, strategyId: s.id });
                  onPlay();
                }}
              >
                ▶
              </button>
              {previewId === s.id && <StrategyPreview strategy={s} />}
            </li>
          ))}
        </ul>
      )}

      {chosen?.description && <p className="description">{chosen.description}</p>}

      <button className="primary play" disabled={!chosen} onClick={onPlay}>
        {chosen ? t("setup.playNamed", { name: chosen.name }) : t("setup.play")}
      </button>
    </div>
  );
}
