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
  ["siegeworkshop", "taller de asedio"],
  ["towncenter", "centro urbano"],
  ["loom", "telar"],
  ["wheelbarrow", "carretilla"],
  ["handcart", "carro de mano"],
  ["scout", "explorador"],
  // Unidades, edificios y tecnologías: nombres oficiales de la versión en español del juego.
  ["militia", "milicia"],
  ["manatarms", "hombre de armas"],
  ["longswordsman", "espadachín de espada larga"],
  ["spearman", "lancero"],
  ["archer", "arquero"],
  ["cavalryarcher", "arquero a caballo"],
  ["elephantarcher", "arquero en elefante"],
  ["crossbowman", "ballestero"],
  ["skirmisher", "hostigador"],
  ["knight", "caballero"],
  ["teutonicknight", "caballero de la Orden Teutónica"],
  ["lightcavalry", "caballería ligera"],
  ["camelrider", "jinete de camello"],
  ["monk", "monje"],
  ["batteringram", "ariete"],
  ["mangonel", "mangana"],
  ["scorpion", "escorpión"],
  ["fishingship", "pesquero"],
  ["galley", "galera"],
  ["wargalley", "galera de guerra"],
  ["firegalley", "galera incendiaria"],
  ["castle", "castillo"],
  ["monastery", "monasterio"],
  ["university", "universidad"],
  ["dock", "muelle"],
  ["tower", "torre"],
  ["watchtower", "atalaya"],
  ["palisade", "empalizada"],
  ["stonewall", "muro de piedra"],
  ["fishtrap", "trampa para peces"],
  ["doublebitaxe", "hacha de doble filo"],
  ["bowsaw", "sierra de arco"],
  ["twomansaw", "sierra a dos"],
  ["horsecollar", "collera"],
  ["heavyplow", "arado pesado"],
  ["goldmining", "minería de oro"],
  ["stonemining", "cantería"],
  ["fletching", "emplumado de flechas"],
  ["bodkinarrow", "flecha de punzón"],
  ["paddedarcherarmor", "armadura acolchada de arquero"],
  ["forging", "forja"],
  ["scalemailarmor", "armadura de láminas"],
  ["scalebardingarmor", "armadura de láminas de caballería"],
  ["bloodlines", "pureza de sangre"],
  ["husbandry", "ganadería"],
  ["thumbring", "dactilera"],
  ["ballistics", "balística"],
  ["chemistry", "química"],
  ["townwatch", "guardia urbana"],
  ["gillnets", "red agallera"],
  ["supllies", "suministros"],
  ["arson", "incendiarismo"],
  ["feudalage", "Edad Feudal"],
  ["castleage", "Edad de los Castillos"],
  ["imperialage", "Edad Imperial"],
];

/** Etiqueta legible para un ícono a partir de su ruta. */
export function iconLabel(path: string): string {
  const file = (path.split("/").pop() ?? path).replace(/\.[a-z]+$/i, "");
  // Sin guiones ni espacios, para que "Archery_range" coincida con "archeryrange".
  const key = file.toLowerCase().replace(/[_\-\s]/g, "");
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

/**
 * Palabras clave que usan las estrategias de la comunidad dentro del texto
 * (vienen de las traducciones de RTS Overlay) → etiqueta en español.
 */
const TEXT_KEYWORDS: Record<string, string> = {
  foodUnderTC: "comida bajo el centro urbano",
  stragglerTree: "árbol suelto",
  stragglerTrees: "árboles sueltos",
  darkAge: "Alta Edad Media",
  feudalAge: "Edad Feudal",
  castleAge: "Edad de los Castillos",
  imperialAge: "Edad Imperial",
  battleElephant: "elefantes de guerra",
  knight: "caballeros",
  scoutCavalry: "exploradores",
  archer: "arqueros",
  crossbowman: "ballesteros",
  skirmisher: "hostigadores",
  manAtArms: "hombres de armas",
  militia: "milicias",
  spearman: "lanceros",
  monk: "monjes",
  townCenter: "centro urbano",
  house: "casa",
  farm: "granja",
  mill: "molino",
  market: "mercado",
  blacksmith: "herrería",
  barracks: "cuartel",
  stable: "establo",
  archeryRange: "galería de tiro",
  lumberCamp: "campamento maderero",
  miningCamp: "campamento minero",
  monastery: "monasterio",
  university: "universidad",
  castle: "castillo",
  siegeWorkshop: "taller de asedio",
  batteringRam: "arietes",
  mangonel: "manganas",
  scorpion: "escorpiones",
  loom: "telar",
  wheelbarrow: "carretilla",
  handCart: "carro de mano",
  doubleBitAxe: "hacha de doble filo",
  horseCollar: "collera",
  goldMining: "minería de oro",
  // Tecnologías y unidades: nombres oficiales de la versión en español del juego.
  goldShaftMining: "pozo minero aurífero",
  stoneMining: "cantería",
  stoneShaftMining: "pozo de cantera",
  bowSaw: "sierra de arco",
  twoManSaw: "sierra a dos",
  heavyPlow: "arado pesado",
  cropRotation: "rotación de cultivos",
  bloodlines: "pureza de sangre",
  husbandry: "ganadería",
  fletching: "emplumado de flechas",
  bodkinArrow: "flecha de punzón",
  ballistics: "balística",
  chemistry: "química",
  thumbRing: "dactilera",
  forging: "forja",
  ironCasting: "fundición de hierro",
  scaleMailArmor: "armadura de láminas",
  scaleBardingArmor: "armadura de láminas de caballería",
  paddedArcherArmor: "armadura acolchada de arquero",
  leatherArcherArmor: "armadura de cuero de arquero",
  townWatch: "guardia urbana",
  townPatrol: "patrulla urbana",
  murderHoles: "matacanes",
  conscription: "leva",
  tracking: "rastreo",
  conquistador: "conquistadores",
  lightCavalry: "caballería ligera",
  hussar: "húsares",
  pikeman: "piqueros",
  handCannoneer: "artilleros manuales",
  camelRider: "jinetes de camello",
  cavalryArcher: "arqueros a caballo",
  eagleScout: "exploradores águila",
  eagleWarrior: "guerreros águila",
  dock: "muelle",
  fishingShip: "pesqueros",
  fishTrap: "trampa para peces",
  galley: "galeras",
  watchTower: "atalaya",
  palisadeWall: "empalizada",
  stoneWall: "muro de piedra",
  relic: "reliquia",
  // Verbos y conectores de los pasos en inglés. No chocan con palabras en español.
  Create: "Crear",
  Move: "Mover",
  Research: "Investigar",
  Train: "Entrenar",
  Lure: "Atraer",
  Build: "Construir",
  Sell: "Vender",
  Buy: "Comprar",
  food: "comida",
  wall: "muro",
  palisade: "empalizada",
  Before: "Antes de",
  In: "En",
  on: "en",
  from: "de",
  to: "a",
  and: "y",
};

/** Frases de varias palabras: se reemplazan antes que las palabras sueltas. */
const TEXT_PHRASES: ReadonlyArray<[RegExp, string]> = [
  [/\bClick up to\b/g, "Avanzar a"],
  [/\bStart moving close to opponent[’']s\b/g, "Acercarse al rival:"],
  // Nombres de dos palabras escritos como texto ("Build an Archery range").
  [/\barchery ranges?\b/gi, "galería de tiro"],
  [/\btown cent(?:er|re)s?\b/gi, "centro urbano"],
  [/\blumber camps?\b/gi, "campamento maderero"],
  [/\bmining camps?\b/gi, "campamento minero"],
  [/\bsiege workshops?\b/gi, "taller de asedio"],
  [/\bpalisade walls?\b/gi, "empalizada"],
  [/\bstone walls?\b/gi, "muro de piedra"],
];

/**
 * Busca una palabra en el diccionario. Si empieza con mayúscula ("Militia", "Fletching") también
 * prueba con minúscula inicial, como están las claves. `Object.hasOwn` evita que palabras como
 * "constructor" devuelvan propiedades internas del objeto.
 */
function keyword(word: string): string | undefined {
  if (Object.hasOwn(TEXT_KEYWORDS, word)) return TEXT_KEYWORDS[word];
  const lower = word.charAt(0).toLowerCase() + word.slice(1);
  return lower !== word && Object.hasOwn(TEXT_KEYWORDS, lower) ? TEXT_KEYWORDS[lower] : undefined;
}

/** Plural de las etiquetas que se suelen contar ("5 aldeano" → "5 aldeanos"). */
const PLURALS: Record<string, string> = {
  aldeano: "aldeanos",
  aldeana: "aldeanas",
  casa: "casas",
  granja: "granjas",
  molino: "molinos",
  mercado: "mercados",
  herrería: "herrerías",
  cuartel: "cuarteles",
  establo: "establos",
  "galería de tiro": "galerías de tiro",
  "campamento maderero": "campamentos madereros",
  "campamento minero": "campamentos mineros",
  "centro urbano": "centros urbanos",
  "taller de asedio": "talleres de asedio",
  monasterio: "monasterios",
  universidad: "universidades",
  castillo: "castillos",
  explorador: "exploradores",
  milicia: "milicias",
  "hombre de armas": "hombres de armas",
  "espadachín de espada larga": "espadachines de espada larga",
  lancero: "lanceros",
  arquero: "arqueros",
  "arquero a caballo": "arqueros a caballo",
  "arquero en elefante": "arqueros en elefante",
  ballestero: "ballesteros",
  hostigador: "hostigadores",
  caballero: "caballeros",
  "jinete de camello": "jinetes de camello",
  monje: "monjes",
  ariete: "arietes",
  mangana: "manganas",
  escorpión: "escorpiones",
  pesquero: "pesqueros",
  galera: "galeras",
  "galera de guerra": "galeras de guerra",
  torre: "torres",
  empalizada: "empalizadas",
  muelle: "muelles",
  atalaya: "atalayas",
  reliquia: "reliquias",
};

/** "Before/In" delante de una edad llevan artículo: "En la Edad Feudal". */
const BEFORE_AGE = /\b(Before|In)\s+(?=@age\/|(?:dark|feudal|castle|imperial)Age\b)/g;

function withAgeArticle(note: string): string {
  return note.replace(BEFORE_AGE, (_, word: string) =>
    word === "Before" ? "Antes de la " : "En la ",
  );
}

/** El martillo es "construir", salvo como lugar: "Mover 5 de construcción a oro". */
function hammerLabel(label: string, before: string): string {
  return label === "construir" && /\b(?:on|from|to)\s*$/.test(before) ? "construcción" : label;
}

/** Pone la etiqueta en plural si el texto anterior termina en un número mayor a 1. */
function countAware(label: string, before: string): string {
  const n = /(\d+)\s*$/.exec(before)?.[1];
  return n && Number(n) > 1 ? (PLURALS[label] ?? label) : label;
}

/** Reemplaza las palabras clave conocidas dentro de un texto. */
export function translateKeywords(text: string): string {
  const phrased = TEXT_PHRASES.reduce((t, [re, es]) => t.replace(re, es), text);
  // Cada palabra entera se busca en el diccionario; si no está, queda igual. \p{L} incluye
  // las letras acentuadas: así "cómo" no se parte en pedazos que coincidan con una clave.
  return phrased.replace(/\p{L}+/gu, (w, offset: number) => {
    const es = keyword(w);
    return es ? countAware(es, phrased.slice(0, offset)) : w;
  });
}

/** Separa una nota en segmentos de texto e ícono. */
export function parseNote(rawNote: string): NoteSegment[] {
  const note = withAgeArticle(rawNote);
  const segments: NoteSegment[] = [];
  let last = 0;
  for (const match of note.matchAll(ICON_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last)
      segments.push({ type: "text", text: translateKeywords(note.slice(last, start)) });
    const path = match[1] ?? "";
    const before = note.slice(last, start);
    const label = hammerLabel(countAware(iconLabel(path), before), before);
    segments.push({ type: "icon", path, label });
    last = start + match[0].length;
  }
  if (last < note.length)
    segments.push({ type: "text", text: translateKeywords(note.slice(last)) });
  return segments;
}

/** Nota como texto plano, reemplazando los íconos por su etiqueta. */
export function noteToText(note: string): string {
  return parseNote(note)
    .map((s) => (s.type === "text" ? s.text : s.label))
    .join("");
}
