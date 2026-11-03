"use client";

import { DIFFICULTIES, MAP_TYPES, POSITIONS, strategySchema } from "@age-overlay/shared";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { downloadJson } from "@/components/StrategyActions";
import { StepTimeline } from "@/components/StepTimeline";
import { api, errorMessage } from "@/lib/api";
import {
  AGE_LABELS,
  civsByName,
  DIFFICULTY_LABELS,
  MAP_TYPE_LABELS,
  mapsByName,
  POSITION_LABELS,
} from "@/lib/labels";
import type { StrategyDetail, Visibility } from "@/lib/types";
import { ChipSelect } from "./ChipSelect";
import {
  emptyForm,
  emptyStep,
  fromStrategy,
  toStrategy,
  validate,
  warnings,
  type EditorForm,
  type StepForm,
} from "./form-state";

const civOptions = civsByName.map((c) => ({ value: c.name.en, label: c.name.es }));
const mapOptions = mapsByName.map((m) => ({ value: m.id, label: m.name.es }));

const RES_FIELDS: [keyof StepForm, string][] = [
  ["food", "🍖"],
  ["wood", "🪵"],
  ["gold", "🪙"],
  ["stone", "🪨"],
  ["builder", "🔨"],
];

interface Props {
  /** Si viene, se edita esa estrategia; si no, se crea una nueva. */
  existing?: StrategyDetail;
  authorName: string;
}

export function StrategyEditor({ existing, authorName }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<EditorForm>(() =>
    existing ? fromStrategy(existing.data, existing.visibility) : emptyForm(authorName),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [importText, setImportText] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const set = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const setStep = (i: number, patch: Partial<StepForm>) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const moveStep = (i: number, dir: -1 | 1) =>
    setForm((f) => {
      const steps = [...f.steps];
      const j = i + dir;
      if (j < 0 || j >= steps.length) return f;
      [steps[i], steps[j]] = [steps[j]!, steps[i]!];
      return { ...f, steps };
    });

  const warns = useMemo(() => warnings(form), [form]);
  const preview = useMemo(() => validate(form), [form]);

  const doImport = () => {
    try {
      const parsed = strategySchema.parse(JSON.parse(importText ?? ""));
      setForm(fromStrategy(parsed, form.visibility));
      setImportText(null);
      setErrors([]);
    } catch (e) {
      setErrors([
        `No se pudo importar: ${e instanceof SyntaxError ? "JSON inválido" : "no tiene el formato esperado"}`,
      ]);
    }
  };

  const save = async () => {
    const result = validate(form);
    if (!result.ok) {
      setErrors(result.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    setErrors([]);
    try {
      const body = { ...result.strategy, visibility: form.visibility };
      const saved = existing
        ? await api<StrategyDetail>(`/api/strategies/${existing.id}`, { method: "PUT", body })
        : await api<StrategyDetail>("/api/strategies", { method: "POST", body });
      router.push(`/estrategias/${saved.slug}`);
      router.refresh();
    } catch (e) {
      setErrors([errorMessage(e)]);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {errors.length > 0 && (
        <div className="card border-red p-4 text-sm text-red" role="alert">
          <p className="font-bold">Revisá estos datos:</p>
          <ul className="list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className={`btn text-xs ${tab === "edit" ? "btn-red" : "btn-ghost"}`}
          onClick={() => setTab("edit")}
        >
          Editar
        </button>
        <button
          className={`btn text-xs ${tab === "preview" ? "btn-red" : "btn-ghost"}`}
          onClick={() => setTab("preview")}
        >
          Vista previa
        </button>
        <span className="flex-1" />
        <button className="btn btn-ghost text-xs" onClick={() => setImportText("")}>
          Importar JSON
        </button>
        <button
          className="btn btn-ghost text-xs"
          onClick={() => downloadJson(form.name || "estrategia", toStrategy(form))}
        >
          Exportar JSON
        </button>
      </div>

      {importText !== null && (
        <div className="card space-y-3 p-4">
          <p className="text-sm">
            Pegá una estrategia en formato JSON (compatible con Build Order Guide / RTS Overlay):
          </p>
          <textarea
            className="field h-48 font-mono text-xs"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{ "name": "...", "civilization": "...", "build_order": [...] }'
          />
          <div className="flex gap-2">
            <button className="btn btn-red text-xs" onClick={doImport}>
              Importar
            </button>
            <button className="btn btn-ghost text-xs" onClick={() => setImportText(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {tab === "preview" ? (
        preview.ok ? (
          <StepTimeline steps={preview.strategy.build_order} />
        ) : (
          <p className="card p-4 text-sm text-ink/70">
            Completá los datos obligatorios para ver la vista previa.
          </p>
        )
      ) : (
        <>
          <section className="card grid gap-4 p-5 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              <span className="label text-xs text-ink/60">Nombre *</span>
              <input
                className="field mt-1"
                value={form.name}
                maxLength={100}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <ChipSelect
              label="Civilizaciones"
              value={form.civs}
              options={civOptions}
              onChange={(v) => set("civs", v)}
              emptyText="Genérica (cualquier civ)"
            />
            <ChipSelect
              label="Rivales ideales"
              value={form.vsCivs}
              options={civOptions}
              onChange={(v) => set("vsCivs", v)}
              emptyText="Cualquiera"
            />
            <ChipSelect
              label="Mapas"
              value={form.maps}
              options={mapOptions}
              onChange={(v) => set("maps", v)}
              emptyText="Ninguno en particular"
            />
            <div className="space-y-3 text-sm">
              <fieldset>
                <legend className="label text-xs text-ink/60">Tipo de mapa</legend>
                <div className="mt-1 flex flex-wrap gap-3">
                  {MAP_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.mapTypes.includes(t)}
                        onChange={(e) =>
                          set(
                            "mapTypes",
                            e.target.checked
                              ? [...form.mapTypes, t]
                              : form.mapTypes.filter((x) => x !== t),
                          )
                        }
                      />
                      {MAP_TYPE_LABELS[t]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="label text-xs text-ink/60">Posición</legend>
                <div className="mt-1 flex flex-wrap gap-3">
                  {POSITIONS.map((p) => (
                    <label key={p} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.positions.includes(p)}
                        onChange={(e) =>
                          set(
                            "positions",
                            e.target.checked
                              ? [...form.positions, p]
                              : form.positions.filter((x) => x !== p),
                          )
                        }
                      />
                      {POSITION_LABELS[p]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <label className="text-sm">
              <span className="label text-xs text-ink/60">Dificultad</span>
              <select
                className="field mt-1"
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value as EditorForm["difficulty"])}
              >
                <option value="">—</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="label text-xs text-ink/60">Visibilidad</span>
              <select
                className="field mt-1"
                value={form.visibility}
                onChange={(e) => set("visibility", e.target.value as Visibility)}
              >
                <option value="public">Pública</option>
                <option value="unlisted">No listada (solo con el link)</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="label text-xs text-ink/60">Autor original *</span>
              <input
                className="field mt-1"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="label text-xs text-ink/60">Fuente (video o guía original)</span>
              <input
                className="field mt-1"
                type="url"
                placeholder="https://…"
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="label text-xs text-ink/60">Descripción</span>
              <textarea
                className="field mt-1 h-20"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="label text-xs text-ink/60">Tags (separados por coma)</span>
              <input
                className="field mt-1"
                value={form.tags}
                placeholder="feudal, arqueros, agresiva"
                onChange={(e) => set("tags", e.target.value)}
              />
            </label>
          </section>

          <section className="space-y-3">
            <h2 className="label text-sm text-red">Pasos</h2>
            {form.steps.map((s, i) => (
              <div key={i} className="card space-y-3 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-display text-2xl text-red">#{i + 1}</span>
                  <label className="w-24 text-xs">
                    <span className="label text-ink/60">Aldeanos</span>
                    <input
                      className="field mt-1"
                      type="number"
                      min={0}
                      value={s.villager_count}
                      onChange={(e) => setStep(i, { villager_count: Number(e.target.value) })}
                    />
                  </label>
                  <label className="w-44 text-xs">
                    <span className="label text-ink/60">Edad</span>
                    <select
                      className="field mt-1"
                      value={s.age}
                      onChange={(e) => setStep(i, { age: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4].map((a) => (
                        <option key={a} value={a}>
                          {AGE_LABELS[a]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="w-24 text-xs">
                    <span className="label text-ink/60">Tiempo</span>
                    <input
                      className="field mt-1"
                      placeholder="auto"
                      value={s.time}
                      onChange={(e) => setStep(i, { time: e.target.value })}
                    />
                  </label>
                  {RES_FIELDS.map(([key, icon]) => (
                    <label key={key} className="w-16 text-xs">
                      <span className="text-ink/60">{icon}</span>
                      <input
                        className="field mt-1"
                        type="number"
                        min={0}
                        value={s[key] as number}
                        onChange={(e) => setStep(i, { [key]: Number(e.target.value) })}
                      />
                    </label>
                  ))}
                  <span className="flex-1" />
                  <div className="flex gap-1">
                    <button
                      className="btn btn-ghost px-2 text-xs"
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      aria-label="Subir"
                    >
                      ↑
                    </button>
                    <button
                      className="btn btn-ghost px-2 text-xs"
                      onClick={() => moveStep(i, 1)}
                      disabled={i === form.steps.length - 1}
                      aria-label="Bajar"
                    >
                      ↓
                    </button>
                    <button
                      className="btn btn-ghost px-2 text-xs text-red"
                      disabled={form.steps.length === 1}
                      onClick={() =>
                        set(
                          "steps",
                          form.steps.filter((_, j) => j !== i),
                        )
                      }
                      aria-label="Borrar paso"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <label className="block text-xs">
                  <span className="label text-ink/60">Notas (una por línea)</span>
                  <textarea
                    className="field mt-1 h-20"
                    value={s.notes}
                    onChange={(e) => setStep(i, { notes: e.target.value })}
                    placeholder="6 aldeanos a las ovejas"
                  />
                </label>
              </div>
            ))}
            <button
              className="btn btn-ghost w-full"
              onClick={() => set("steps", [...form.steps, emptyStep(form.steps.at(-1))])}
            >
              + Agregar paso
            </button>
          </section>
        </>
      )}

      {warns.length > 0 && (
        <ul className="list-disc pl-5 text-xs text-ink/60">
          {warns.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      )}

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur">
        <button className="btn btn-ghost" onClick={() => router.back()}>
          Cancelar
        </button>
        <button className="btn btn-red" onClick={save} disabled={saving}>
          {saving ? "Guardando…" : existing ? "Guardar cambios" : "Publicar estrategia"}
        </button>
      </div>
    </div>
  );
}
