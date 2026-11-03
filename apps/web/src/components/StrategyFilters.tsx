"use client";

import { MAP_TYPES, POSITIONS } from "@age-overlay/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { civsByName, MAP_TYPE_LABELS, mapsByName, POSITION_LABELS } from "@/lib/labels";

/** Filtros del listado: cada cambio actualiza la URL (y la página se vuelve a renderizar). */
export function StrategyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  };

  const select = (key: string, label: string, options: [string, string][]) => (
    <label className="text-sm">
      <span className="label text-xs text-ink/60">{label}</span>
      <select
        className="field mt-1"
        value={params.get(key) ?? ""}
        onChange={(e) => set(key, e.target.value)}
      >
        <option value="">Todos</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form
      className={`grid gap-3 md:grid-cols-6 ${pending ? "opacity-60" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        set("q", String(new FormData(e.currentTarget).get("q") ?? ""));
      }}
    >
      <label className="text-sm md:col-span-2">
        <span className="label text-xs text-ink/60">Buscar</span>
        <input
          name="q"
          className="field mt-1"
          placeholder="Nombre de la estrategia"
          defaultValue={params.get("q") ?? ""}
        />
      </label>
      {select(
        "civ",
        "Civilización",
        civsByName.map((c) => [c.name.en, c.name.es]),
      )}
      {select(
        "map",
        "Mapa",
        mapsByName.map((m) => [m.id, m.name.es]),
      )}
      {select(
        "mapType",
        "Tipo de mapa",
        MAP_TYPES.map((t) => [t, MAP_TYPE_LABELS[t] ?? t]),
      )}
      {select(
        "position",
        "Posición",
        POSITIONS.map((p) => [p, POSITION_LABELS[p] ?? p]),
      )}
      <div className="flex items-center gap-2 md:col-span-6">
        <span className="label text-xs text-ink/60">Orden:</span>
        {[
          ["top", "Más votadas"],
          ["new", "Más nuevas"],
        ].map(([value, text]) => (
          <button
            key={value}
            type="button"
            onClick={() => set("sort", value === "top" ? "" : value!)}
            className={`btn text-xs ${(params.get("sort") ?? "top") === value ? "btn-red" : "btn-ghost"}`}
          >
            {text}
          </button>
        ))}
      </div>
    </form>
  );
}
