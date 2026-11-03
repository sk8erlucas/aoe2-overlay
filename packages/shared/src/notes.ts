/**
 * Las notas de los pasos pueden traer íconos con la sintaxis de la comunidad:
 *   "Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@"
 * Acá las separamos en segmentos de texto e ícono. Mientras no tengamos un set de íconos
 * propio, cada ícono tiene una etiqueta de texto para mostrar.
 */

export type NoteSegment =
  { type: "text"; text: string } | { type: "icon"; path: string; label: string };

const ICON_PATTERN = /@([^@\s]+\.(?:png|jpg|jpeg|webp|svg))@/gi;

/** Palabras clave del nombre de archivo → etiqueta en español. Se busca por "contiene". */
const ICON_LABELS: ReadonlyArray<[string, string]> = [
  ["malevill", "aldeano"],
  ["femalevill", "aldeana"],
  ["villager", "aldeano"],
  ["sheep", "ovejas"],
  ["boar", "jabalí"],
  ["deer", "ciervos"],
  ["berrybush", "bayas"],
  ["wood", "madera"],
  ["gold", "oro"],
  ["stone", "piedra"],
  ["hammer", "construir"],
  ["farm", "granja"],
  ["house", "casa"],
  ["mill", "molino"],
  ["lumbercamp", "campamento maderero"],
  ["miningcamp", "campamento minero"],
  ["barracks", "cuartel"],
  ["archeryrange", "galería de tiro"],
  ["stable", "establo"],
  ["blacksmith", "herrería"],
  ["market", "mercado"],
  ["towncenter", "centro urbano"],
  ["loom", "telar"],
  ["scout", "explorador"],
  ["feudalage", "Edad Feudal"],
  ["castleage", "Edad de los Castillos"],
  ["imperialage", "Edad Imperial"],
];

/** Etiqueta legible para un ícono a partir de su ruta. */
export function iconLabel(path: string): string {
  const file = (path.split("/").pop() ?? path).replace(/\.[a-z]+$/i, "");
  const key = file.toLowerCase();
  // Las más específicas primero (p. ej. "femalevill" antes que "malevill").
  const match = [...ICON_LABELS]
    .sort((a, b) => b[0].length - a[0].length)
    .find(([needle]) => key.includes(needle));
  if (match) return match[1];
  return file
    .replace(/(_aoe2de|_alpha|aoe2de_|de$)/gi, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

/** Separa una nota en segmentos de texto e ícono. */
export function parseNote(note: string): NoteSegment[] {
  const segments: NoteSegment[] = [];
  let last = 0;
  for (const match of note.matchAll(ICON_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ type: "text", text: note.slice(last, start) });
    const path = match[1] ?? "";
    segments.push({ type: "icon", path, label: iconLabel(path) });
    last = start + match[0].length;
  }
  if (last < note.length) segments.push({ type: "text", text: note.slice(last) });
  return segments;
}

/** Nota como texto plano, reemplazando los íconos por su etiqueta. */
export function noteToText(note: string): string {
  return parseNote(note)
    .map((s) => (s.type === "text" ? s.text : s.label))
    .join("");
}
