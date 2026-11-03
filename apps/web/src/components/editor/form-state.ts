/**
 * Estado del editor ↔ JSON de estrategia. Separado del componente para poder testearlo.
 */
import {
  getCivilizations,
  strategySchema,
  type Difficulty,
  type MapType,
  type Position,
  type Strategy,
} from "@age-overlay/shared";
import type { Visibility } from "@/lib/types";

export interface StepForm {
  villager_count: number;
  age: number;
  /** "m:ss" o vacío. */
  time: string;
  food: number;
  wood: number;
  gold: number;
  stone: number;
  builder: number;
  /** Una nota por línea. */
  notes: string;
}

export interface EditorForm {
  name: string;
  civs: string[];
  author: string;
  description: string;
  source: string;
  maps: string[];
  mapTypes: MapType[];
  positions: Position[];
  vsCivs: string[];
  difficulty: Difficulty | "";
  tags: string;
  visibility: Visibility;
  steps: StepForm[];
}

export const emptyStep = (prev?: StepForm): StepForm => ({
  villager_count: (prev?.villager_count ?? 3) + (prev ? 1 : 3),
  age: prev?.age ?? 1,
  time: "",
  food: prev?.food ?? 0,
  wood: prev?.wood ?? 0,
  gold: prev?.gold ?? 0,
  stone: prev?.stone ?? 0,
  builder: 0,
  notes: "",
});

export function emptyForm(author: string): EditorForm {
  return {
    name: "",
    civs: [],
    author,
    description: "",
    source: "",
    maps: [],
    mapTypes: [],
    positions: [],
    vsCivs: [],
    difficulty: "",
    tags: "",
    visibility: "public",
    steps: [emptyStep()],
  };
}

export function fromStrategy(s: Strategy, visibility: Visibility = "public"): EditorForm {
  return {
    name: s.name,
    civs: getCivilizations(s),
    author: s.author,
    description: s.description ?? "",
    source: s.source ?? "",
    maps: s.maps ?? [],
    mapTypes: s.map_types ?? [],
    positions: s.positions ?? [],
    vsCivs: s.vs_civilizations ?? [],
    difficulty: s.difficulty ?? "",
    tags: (s.tags ?? []).join(", "),
    visibility,
    steps: s.build_order.map((st) => ({
      villager_count: st.villager_count,
      age: st.age,
      time:
        st.time === undefined
          ? ""
          : typeof st.time === "number"
            ? secondsToClock(st.time)
            : st.time,
      food: st.resources.food,
      wood: st.resources.wood,
      gold: st.resources.gold,
      stone: st.resources.stone,
      builder: st.resources.builder ?? 0,
      notes: st.notes.join("\n"),
    })),
  };
}

function secondsToClock(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

/** Arma el JSON (sin validar). Omite los campos opcionales vacíos. */
export function toStrategy(f: EditorForm): Record<string, unknown> {
  const tags = f.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    name: f.name,
    civilization: f.civs.length === 0 ? "Generic" : f.civs.length === 1 ? f.civs[0] : f.civs,
    author: f.author,
    ...(f.description.trim() && { description: f.description.trim() }),
    ...(f.source.trim() && { source: f.source.trim() }),
    ...(f.maps.length && { maps: f.maps }),
    ...(f.mapTypes.length && { map_types: f.mapTypes }),
    ...(f.positions.length && { positions: f.positions }),
    ...(f.vsCivs.length && { vs_civilizations: f.vsCivs }),
    ...(f.difficulty && { difficulty: f.difficulty }),
    ...(tags.length && { tags }),
    build_order: f.steps.map((s) => ({
      villager_count: Number(s.villager_count),
      age: Number(s.age),
      ...(s.time.trim() && { time: s.time.trim() }),
      resources: {
        wood: Number(s.wood),
        food: Number(s.food),
        gold: Number(s.gold),
        stone: Number(s.stone),
        ...(Number(s.builder) > 0 && { builder: Number(s.builder) }),
      },
      notes: s.notes
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    })),
  };
}

export type ValidationResult = { ok: true; strategy: Strategy } | { ok: false; errors: string[] };

const FIELD_NAMES: Record<string, string> = {
  name: "Nombre",
  author: "Autor",
  source: "Fuente",
  civilization: "Civilización",
  build_order: "Pasos",
  notes: "notas",
  villager_count: "aldeanos",
  time: "tiempo",
};

export function validate(f: EditorForm): ValidationResult {
  const result = strategySchema.safeParse(toStrategy(f));
  if (result.success) return { ok: true, strategy: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((i) => {
      const path = i.path
        .map((p) => (typeof p === "number" ? `#${p + 1}` : (FIELD_NAMES[String(p)] ?? String(p))))
        .join(" › ");
      return `${path || "Estrategia"}: ${i.message}`;
    }),
  };
}

/** Avisos que no impiden guardar (los mismos que el validador del repo). */
export function warnings(f: EditorForm): string[] {
  return f.steps.flatMap((s, i) => {
    const sum =
      Number(s.food) + Number(s.wood) + Number(s.gold) + Number(s.stone) + Number(s.builder);
    return sum !== Number(s.villager_count)
      ? [`Paso #${i + 1}: los recursos suman ${sum} pero hay ${s.villager_count} aldeanos`]
      : [];
  });
}
