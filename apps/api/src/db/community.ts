/**
 * Transformación de estrategias de la comunidad (Build Order Guide / RTS Overlay) antes de
 * publicarlas. Es puro y testeable; el script que escribe en la base está en
 * import-community.ts.
 */
import { MAPS, findCiv } from "@age-overlay/game-data";
import { getCivilizations, strategySchema, type MapType, type Strategy } from "@age-overlay/shared";
import { slugify } from "../lib/strategy-columns";

export const BOG_TAG = "buildorderguide";
export const bogUrl = (id: string) => `https://www.buildorderguide.com/#/build/${id}`;

/** Palabras del nombre/descripción → tipo de mapa (solo si la estrategia no lo trae). */
const MAP_TYPE_HINTS: [RegExp, MapType][] = [
  [/\b(water|naval|islands?|agua|islas?)\b/i, "water"],
  [/\b(closed|arena|black ?forest|selva negra|hideout|fortress|cerrad[oa])\b/i, "closed"],
  [/\b(hybrid|h[ií]brido|nomad)\b/i, "hybrid"],
  [/\b(open|arabia|abiert[oa])\b/i, "open"],
];

export interface ImportResult {
  ok: true;
  strategy: Strategy;
  slug: string;
  warnings: string[];
}
export interface ImportError {
  ok: false;
  errors: string[];
}

/**
 * Valida y completa una estrategia exportada.
 * @param id  id de la estrategia en Build Order Guide (el nombre del archivo).
 */
export function prepareCommunityStrategy(raw: unknown, id: string): ImportResult | ImportError {
  const parsed = strategySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`),
    };
  }
  const s = { ...parsed.data };
  const warnings: string[] = [];

  // Crédito: el autor original se respeta y la fuente apunta a la estrategia original.
  if (!s.source) s.source = bogUrl(id);
  s.tags = [...new Set([...(s.tags ?? []), BOG_TAG])];

  // Algunas exportaciones dejan "undefined" donde faltaba un número ("Lure undefined @boar@").
  let cleaned = 0;
  s.build_order = s.build_order.map((step) => ({
    ...step,
    notes: step.notes.map((note) => {
      const fixed = note.replace(/\s*\bundefined\b/g, "").trim();
      if (fixed !== note) cleaned++;
      return fixed;
    }),
  }));
  if (cleaned) warnings.push(`se quitó "undefined" de ${cleaned} nota(s)`);

  for (const civ of getCivilizations(s)) {
    if (!findCiv(civ)) warnings.push(`civilización desconocida: "${civ}"`);
  }

  // Deducir mapas y tipo de mapa del texto, solo si no vienen.
  const text = `${s.name} ${s.description ?? ""}`;
  if (!s.maps?.length) {
    const maps = MAPS.filter((m) =>
      new RegExp(`\\b${m.name.en.replace(/\s+/g, "\\s*")}\\b`, "i").test(text),
    ).map((m) => m.id);
    if (maps.length) s.maps = maps;
  }
  if (!s.map_types?.length) {
    const types = MAP_TYPE_HINTS.filter(([re]) => re.test(text)).map(([, t]) => t);
    if (types.length) s.map_types = [...new Set(types)];
  }

  const slug = `${slugify(s.name).slice(0, 50)}-${id.slice(0, 6).toLowerCase()}`;
  return { ok: true, strategy: s, slug, warnings };
}
