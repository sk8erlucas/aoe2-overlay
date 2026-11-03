import { CIVS, MAPS } from "@age-overlay/game-data";

export const POSITION_LABELS: Record<string, string> = {
  "1v1": "1 contra 1",
  flank: "Flanco",
  pocket: "Bolsillo",
};

export const MAP_TYPE_LABELS: Record<string, string> = {
  open: "Abierto",
  closed: "Cerrado",
  hybrid: "Híbrido",
  water: "Agua",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export const AGE_LABELS: Record<number, string> = {
  1: "Alta Edad Media",
  2: "Feudal",
  3: "Castillos",
  4: "Imperial",
};

export const civsByName = [...CIVS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));
export const mapsByName = [...MAPS].sort((a, b) => a.name.es.localeCompare(b.name.es, "es"));

/** "Malay" → "Malayos"; "Generic" / lista vacía → "Cualquier civ". */
export function civLabel(civilization: string | string[]): string {
  const list = (Array.isArray(civilization) ? civilization : [civilization]).filter(
    (c) => !["any", "generic"].includes(c.toLowerCase()),
  );
  if (list.length === 0) return "Cualquier civ";
  return list
    .map((c) => CIVS.find((x) => x.name.en.toLowerCase() === c.toLowerCase())?.name.es ?? c)
    .join(", ");
}

export function mapLabel(id: string): string {
  return MAPS.find((m) => m.id === id.toLowerCase())?.name.es ?? id;
}
