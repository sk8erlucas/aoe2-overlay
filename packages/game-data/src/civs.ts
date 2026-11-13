import type { LocalizedName } from "./types";

export interface Civ {
  /** Id estable en snake_case. */
  id: string;
  /** El nombre en inglés es el que se usa en el campo `civilization` de las estrategias. */
  name: LocalizedName;
}

/**
 * Civilizaciones jugables en partidas clasificatorias de AoE2 DE.
 * Si sale una DLC nueva, agregala acá (orden alfabético por nombre en inglés).
 */
export const CIVS = [
  { id: "armenians", name: { en: "Armenians", es: "Armenios" } },
  { id: "aztecs", name: { en: "Aztecs", es: "Aztecas" } },
  { id: "bengalis", name: { en: "Bengalis", es: "Bengalíes" } },
  { id: "berbers", name: { en: "Berbers", es: "Bereberes" } },
  { id: "bohemians", name: { en: "Bohemians", es: "Bohemios" } },
  { id: "britons", name: { en: "Britons", es: "Britanos" } },
  { id: "bulgarians", name: { en: "Bulgarians", es: "Búlgaros" } },
  { id: "burgundians", name: { en: "Burgundians", es: "Borgoñones" } },
  { id: "burmese", name: { en: "Burmese", es: "Birmanos" } },
  { id: "byzantines", name: { en: "Byzantines", es: "Bizantinos" } },
  { id: "celts", name: { en: "Celts", es: "Celtas" } },
  { id: "chinese", name: { en: "Chinese", es: "Chinos" } },
  { id: "cumans", name: { en: "Cumans", es: "Cumanos" } },
  { id: "dravidians", name: { en: "Dravidians", es: "Drávidas" } },
  { id: "ethiopians", name: { en: "Ethiopians", es: "Etíopes" } },
  { id: "franks", name: { en: "Franks", es: "Francos" } },
  { id: "georgians", name: { en: "Georgians", es: "Georgianos" } },
  { id: "goths", name: { en: "Goths", es: "Godos" } },
  { id: "gurjaras", name: { en: "Gurjaras", es: "Gurjaras" } },
  { id: "hindustanis", name: { en: "Hindustanis", es: "Indostaníes" } },
  { id: "huns", name: { en: "Huns", es: "Hunos" } },
  { id: "incas", name: { en: "Incas", es: "Incas" } },
  { id: "italians", name: { en: "Italians", es: "Italianos" } },
  { id: "japanese", name: { en: "Japanese", es: "Japoneses" } },
  { id: "jurchens", name: { en: "Jurchens", es: "Yurchen" } },
  { id: "khitans", name: { en: "Khitans", es: "Kitán" } },
  { id: "khmer", name: { en: "Khmer", es: "Jemeres" } },
  { id: "koreans", name: { en: "Koreans", es: "Coreanos" } },
  { id: "lithuanians", name: { en: "Lithuanians", es: "Lituanos" } },
  { id: "magyars", name: { en: "Magyars", es: "Magiares" } },
  { id: "malay", name: { en: "Malay", es: "Malayos" } },
  { id: "malians", name: { en: "Malians", es: "Malíes" } },
  { id: "mapuche", name: { en: "Mapuche", es: "Mapuches" } },
  { id: "mayans", name: { en: "Mayans", es: "Mayas" } },
  { id: "mongols", name: { en: "Mongols", es: "Mongoles" } },
  { id: "muisca", name: { en: "Muisca", es: "Muiscas" } },
  { id: "persians", name: { en: "Persians", es: "Persas" } },
  { id: "poles", name: { en: "Poles", es: "Polacos" } },
  { id: "portuguese", name: { en: "Portuguese", es: "Portugueses" } },
  { id: "romans", name: { en: "Romans", es: "Romanos" } },
  { id: "saracens", name: { en: "Saracens", es: "Sarracenos" } },
  { id: "saxons", name: { en: "Saxons", es: "Sajones" } },
  { id: "shu", name: { en: "Shu", es: "Shu" } },
  { id: "sicilians", name: { en: "Sicilians", es: "Sicilianos" } },
  { id: "slavs", name: { en: "Slavs", es: "Eslavos" } },
  { id: "spanish", name: { en: "Spanish", es: "Españoles" } },
  { id: "tatars", name: { en: "Tatars", es: "Tártaros" } },
  { id: "teutons", name: { en: "Teutons", es: "Teutones" } },
  { id: "tupi", name: { en: "Tupi", es: "Tupíes" } },
  { id: "turks", name: { en: "Turks", es: "Turcos" } },
  { id: "varangians", name: { en: "Varangians", es: "Varegos" } },
  { id: "vietnamese", name: { en: "Vietnamese", es: "Vietnamitas" } },
  { id: "vikings", name: { en: "Vikings", es: "Vikingos" } },
  { id: "wei", name: { en: "Wei", es: "Wei" } },
  { id: "wu", name: { en: "Wu", es: "Wu" } },
] as const satisfies readonly Civ[];
