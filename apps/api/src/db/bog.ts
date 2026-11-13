/**
 * Estrategias de Build Order Guide (https://www.buildorderguide.com): lectura de su Firestore
 * público, conversión al formato del overlay y selección de las mejores.
 *
 * `toOverlayStrategy` es un port de `exportForRTSOverlay` (src/utils/rtsOverlayExport.ts) de
 * https://github.com/bergerjohannes/buildorderguide, MIT License, Copyright (c) 2022-2026
 * Johannes Berger. Se quitó la parte del portapapeles y del navegador; la lógica es la misma.
 */

export const BOG_PROJECT = "build-order-guide";
export const BOG_COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${BOG_PROJECT}/databases/(default)/documents/published-builds`;

// ---------------------------------------------------------------------------------------------
// Firestore REST → JSON común

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { referenceValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

export interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

export function fromFirestoreValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields ?? {});
  return undefined;
}

function fromFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFirestoreValue(v)]));
}

/** Documento de `published-builds` → build con su id (el último tramo de `name`). */
export function fromFirestoreDocument(doc: FirestoreDocument): BogBuild {
  const id = doc.name.split("/").pop() ?? "";
  return { ...(fromFirestoreFields(doc.fields ?? {}) as Partial<BogBuild>), id } as BogBuild;
}

// ---------------------------------------------------------------------------------------------
// Formato de Build Order Guide

export interface BogStep {
  type: string;
  resources?: { wood?: number; food?: number; gold?: number; stone?: number; build?: number };
  count?: number | string;
  task?: string;
  from?: string;
  to?: string;
  animal?: string;
  tech?: string[];
  age?: string;
  buildings?: { type: string; count: number }[];
  text?: string;
  action?: string;
  resource?: string;
  unit?: string;
}

export interface BogBuild {
  id: string;
  title?: string;
  civilization?: string;
  author?: string;
  description?: string;
  difficulty?: number;
  attributes?: string[];
  build?: BogStep[];
  avg_rating?: number;
  number_of_ratings?: number;
  reference?: string;
  status?: string;
}

export const bogBuildUrl = (id: string) => `https://www.buildorderguide.com/builds/${id}`;

// ---------------------------------------------------------------------------------------------
// Conversión al formato del overlay (port de exportForRTSOverlay)

/** Nombres de Build Order Guide → íconos de RTS Overlay (mismo diccionario que su exportador). */
const IMAGES: Record<string, string> = {
  sheep: "animal/Sheep_aoe2DE.png",
  sheeps: "animal/Sheep_aoe2DE.png",
  "shore fish": "animal/AoE2_DE_shore_fish_icon.png",
  boar: "animal/Boar_aoe2DE.png",
  boars: "animal/Boar_aoe2DE.png",
  deer: "animal/Deer_aoe2DE.png",
  deers: "animal/Deer_aoe2DE.png",
  farm: "mill/FarmDE.png",
  farms: "mill/FarmDE.png",
  wood: "resource/Aoe2de_wood.png",
  stone: "resource/Aoe2de_stone.png",
  gold: "resource/Aoe2de_gold.png",
  berry: "resource/BerryBushDE.png",
  berries: "resource/BerryBushDE.png",
  food: "resource/Aoe2de_food.png",
  build: "resource/Aoe2de_hammer.png",
  folwark: "mill/Aoe2-icon--folwark.png",
  folwarks: "mill/Aoe2-icon--folwark.png",
  house: "other/House_aoe2DE.png",
  houses: "other/House_aoe2DE.png",
  mill: "mill/Mill_aoe2de.png",
  mills: "mill/Mill_aoe2de.png",
  "lumber camp": "lumber_camp/Lumber_camp_aoe2de.png",
  "lumber camps": "lumber_camp/Lumber_camp_aoe2de.png",
  "mining camp": "mining_camp/Mining_camp_aoe2de.png",
  "mining camps": "mining_camp/Mining_camp_aoe2de.png",
  dock: "dock/Dock_aoe2de.png",
  docks: "dock/Dock_aoe2de.png",
  barracks: "barracks/Barracks_aoe2DE.png",
  market: "market/Market_aoe2DE.png",
  markets: "market/Market_aoe2DE.png",
  blacksmith: "blacksmith/Blacksmith_aoe2de.png",
  blacksmiths: "blacksmith/Blacksmith_aoe2de.png",
  range: "archery_range/Archery_range_aoe2DE.png",
  ranges: "archery_range/Archery_range_aoe2DE.png",
  "archery range": "archery_range/Archery_range_aoe2DE.png",
  "archery ranges": "archery_range/Archery_range_aoe2DE.png",
  stable: "stable/Stable_aoe2DE.png",
  stables: "stable/Stable_aoe2DE.png",
  tower: "defensive_structures/Tower_aoe2de.png",
  towers: "defensive_structures/Tower_aoe2de.png",
  "town center": "town_center/Towncenter_aoe2DE.png",
  "town centers": "town_center/Towncenter_aoe2DE.png",
  tc: "town_center/Towncenter_aoe2DE.png",
  monastery: "monastery/MonasteryAoe2DE.png",
  monasteries: "monastery/MonasteryAoe2DE.png",
  university: "university/University_AoE2_DE.png",
  universities: "university/University_AoE2_DE.png",
  "siege workshop": "siege_workshop/Siege_workshop_aoe2DE.png",
  "siege workshops": "siege_workshop/Siege_workshop_aoe2DE.png",
  castle: "castle/Castle_aoe2DE.png",
  castles: "castle/Castle_aoe2DE.png",
  krepost: "defensive_structures/Krepost_aoe2de.png",
  kreposts: "defensive_structures/Krepost_aoe2de.png",
  feitoria: "other/Feitoria_aoe2DE.png",
  "fish trap": "dock/Fish_trap_aoe2DE.png",
  "fish traps": "dock/Fish_trap_aoe2DE.png",
  palisade: "defensive_structures/Palisade_wall_aoe2de.png",
  palisades: "defensive_structures/Palisade_wall_aoe2de.png",
  wall: "defensive_structures/Palisade_wall_aoe2de.png",
  walls: "defensive_structures/Palisade_wall_aoe2de.png",
  "stone wall": "defensive_structures/Stone_wall_aoe2de.png",
  "stone walls": "defensive_structures/Stone_wall_aoe2de.png",
  donjon: "defensive_structures/Donjon_aoe2DE.png",
  donjons: "defensive_structures/Donjon_aoe2DE.png",
  wonder: "other/Wonder_aoe2DE.png",
  wonders: "other/Wonder_aoe2DE.png",
  caravanserai: "other/Ao2de_caravanserai_icon.png",
  caravanserais: "other/Ao2de_caravanserai_icon.png",
  "dark age": "age/DarkAgeIconDE_alpha.png",
  "feudal age": "age/FeudalAgeIconDE_alpha.png",
  "castle age": "age/CastleAgeIconDE_alpha.png",
  "imperial age": "age/ImperialAgeIconDE_alpha.png",
  chemistry: "university/ChemistryDE.png",
  "double-bit axe": "lumber_camp/DoubleBitAxe_aoe2DE.png",
  "horse collar": "mill/HorseCollarDE.png",
  loom: "town_center/LoomDE.png",
  wheelbarrow: "town_center/WheelbarrowDE.png",
  "hand cart": "town_center/HandcartDE.png",
  "bow saw": "lumber_camp/BowSawDE.png",
  "two-man saw": "lumber_camp/TwoManSawDE.png",
  "heavy plow": "mill/HeavyPlowDE.png",
  "crop rotation": "mill/CropRotationDE.png",
  "gold mining": "mining_camp/GoldMiningDE.png",
  "gold shaft mining": "mining_camp/GoldShaftMiningDE.png",
  "stone mining": "mining_camp/StoneMiningDE.png",
  "stone shaft mining": "mining_camp/StoneShaftMiningDE.png",
  gillnets: "dock/GillnetsDE.png",
  fletching: "blacksmith/FletchingDE.png",
  "bodkin arrow": "blacksmith/BodkinArrowDE.png",
  bracer: "blacksmith/BracerDE.png",
  "padded archer armor": "blacksmith/PaddedArcherArmorDE.png",
  "leather archer armor": "blacksmith/LeatherArcherArmorDE.png",
  "ring archer armor": "blacksmith/RingArcherArmorDE.png",
  ballistics: "university/BallisticsDE.png",
  "thumb ring": "archery_range/ThumbRingDE.png",
  "parthian tactics": "archery_range/ParthianTacticsDE.png",
  supplies: "barracks/Suplliesicon.png",
  forging: "blacksmith/Forging_aoe2de.png",
  "iron casting": "blacksmith/IronCastingDE.png",
  "blast furnace": "blacksmith/BlastFurnaceDE.png",
  "scale mail armor": "blacksmith/ScaleMailArmorDE.png",
  "chain mail armor": "blacksmith/ChainMailArmorDE.png",
  "plate mail armor": "blacksmith/PlateMailArmorDE.png",
  bloodlines: "stable/BloodlinesDE.png",
  husbandry: "stable/HusbandryDE.png",
  "scale barding armor": "blacksmith/ScaleBardingArmorDE.png",
  "chain barding armor": "blacksmith/ChainBardingDE.png",
  "plate barding armor": "blacksmith/PlateBardingArmorDE.png",
  "town watch": "town_center/TownWatchDE.png",
  "town patrol": "town_center/TownPatrolDE.png",
  careening: "dock/CareeningDE.png",
  "dry dock": "dock/DryDockDE.png",
  shipwright: "dock/ShipwrightDE.png",
  "man-at-arms": "barracks/ManAtArmsUpgDE.png",
  pikeman: "barracks/PikemanUpDE.png",
  redemption: "monastery/RedemptionDE.png",
  arson: "barracks/ArsonDE.png",
  gambeson: "barracks/GambesonsDE.png",
  gambesons: "barracks/GambesonsDE.png",
  "siege elephant": "siege_workshop/AoE2DE_Siege_Elephant_icon.png",
  "heavy camel rider": "stable/HeavyCamelUpgDE.png",
  vill: "resource/MaleVillDE.jpg",
  vills: "resource/MaleVillDE.jpg",
  villager: "resource/MaleVillDE.jpg",
  villagers: "resource/MaleVillDE.jpg",
  militia: "barracks/MilitiaDE.png",
  militias: "barracks/MilitiaDE.png",
  "man at arms": "barracks/Manatarms_aoe2DE.png",
  "man-at arms": "barracks/Manatarms_aoe2DE.png",
  "men at arms": "barracks/Manatarms_aoe2DE.png",
  "men-at arms": "barracks/Manatarms_aoe2DE.png",
  "men-at-arms": "barracks/Manatarms_aoe2DE.png",
  longswordsman: "barracks/Longswordsman_aoe2DE.png",
  longswordsmen: "barracks/Longswordsman_aoe2DE.png",
  "two-handed swordsman": "barracks/Twohanded_aoe2DE.png",
  "two-handed swordsmen": "barracks/Twohanded_aoe2DE.png",
  champion: "barracks/Champion_aoe2DE.png",
  champions: "barracks/Champion_aoe2DE.png",
  spearman: "barracks/Spearman_aoe2DE.png",
  spearmans: "barracks/Spearman_aoe2DE.png",
  halberdier: "barracks/Halberdier_aoe2DE.png",
  halberdiers: "barracks/Halberdier_aoe2DE.png",
  "eagle scout": "barracks/Eaglescout_aoe2DE.png",
  "eagle scouts": "barracks/Eaglescout_aoe2DE.png",
  "eagle warrior": "barracks/Eaglewarrior_aoe2DE.png",
  "eagle warriors": "barracks/Eaglewarrior_aoe2DE.png",
  "elite eagle warrior": "barracks/EliteEaglewarrior_aoe2DE.png",
  "elite eagle warriors": "barracks/EliteEaglewarrior_aoe2DE.png",
  archer: "archery_range/Archer_aoe2DE.png",
  archers: "archery_range/Archer_aoe2DE.png",
  crossbowman: "archery_range/Crossbowman_aoe2DE.png",
  crossbowmen: "archery_range/Crossbowman_aoe2DE.png",
  arbalester: "archery_range/Arbalester_aoe2DE.png",
  arbalesters: "archery_range/Arbalester_aoe2DE.png",
  skirmisher: "archery_range/Skirmisher_aoe2DE.png",
  skirmishers: "archery_range/Skirmisher_aoe2DE.png",
  "elite skirmisher": "archery_range/Elite_skirmisher_aoe2DE.png",
  "elite skirmishers": "archery_range/Elite_skirmisher_aoe2DE.png",
  "imperial skirmisher": "archery_range/ImperialSkirmisherUpgDE.png",
  "imperial skirmishers": "archery_range/ImperialSkirmisherUpgDE.png",
  "cavalry archer": "archery_range/Cavalryarcher_aoe2DE.png",
  "cavalry archers": "archery_range/Cavalryarcher_aoe2DE.png",
  "heavy cavalry archer": "archery_range/Heavycavalryarcher_aoe2de.png",
  "heavy cavalry archers": "archery_range/Heavycavalryarcher_aoe2de.png",
  "elephant archer": "archery_range/ElephantArcherIcon-DE.png",
  "elephant archers": "archery_range/ElephantArcherIcon-DE.png",
  "elite elephant archer": "archery_range/ElephantArcherIcon-DE.png",
  "elite elephant archers": "archery_range/ElephantArcherIcon-DE.png",
  "hand cannoneer": "archery_range/Hand_cannoneer_aoe2DE.png",
  "hand cannoneers": "archery_range/Hand_cannoneer_aoe2DE.png",
  scout: "stable/Scoutcavalry_aoe2DE.png",
  scouts: "stable/Scoutcavalry_aoe2DE.png",
  "light cavalry": "stable/Lightcavalry_aoe2DE.png",
  hussar: "stable/Hussar_aoe2DE.png",
  hussars: "stable/Hussar_aoe2DE.png",
  knight: "stable/Knight_aoe2DE.png",
  knights: "stable/Knight_aoe2DE.png",
  cavalier: "stable/Cavalier_aoe2DE.png",
  cavaliers: "stable/Cavalier_aoe2DE.png",
  paladin: "stable/Paladin_aoe2DE.png",
  paladins: "stable/Paladin_aoe2DE.png",
  "battle elephant": "stable/Battle_elephant_aoe2DE.png",
  "battle elephants": "stable/Battle_elephant_aoe2DE.png",
  "elite battle elephant": "stable/EliteBattleElephantUpg.png",
  "elite battle elephants": "stable/EliteBattleElephantUpg.png",
  "steppe lancer": "stable/Steppelancericon.png",
  "steppe lancers": "stable/Steppelancericon.png",
  "elite steppe lancer": "stable/Elitesteppelancericon.png",
  "elite steppe lancers": "stable/Elitesteppelancericon.png",
  "camel rider": "stable/Camelrider_aoe2DE.png",
  "camel riders": "stable/Camelrider_aoe2DE.png",
  petard: "castle/Petard_aoe2DE.png",
  petards: "castle/Petard_aoe2DE.png",
  "bombard cannon": "siege_workshop/Bombard_cannon_aoe2DE.png",
  "bombard cannons": "siege_workshop/Bombard_cannon_aoe2DE.png",
  ram: "siege_workshop/Battering_ram_aoe2DE.png",
  rams: "siege_workshop/Battering_ram_aoe2DE.png",
  "battering ram": "siege_workshop/Battering_ram_aoe2DE.png",
  "battering rams": "siege_workshop/Battering_ram_aoe2DE.png",
  scorpion: "siege_workshop/Scorpion_aoe2DE.png",
  scorpions: "siege_workshop/Scorpion_aoe2DE.png",
  mangonel: "siege_workshop/Mangonel_aoe2DE.png",
  mangonels: "siege_workshop/Mangonel_aoe2DE.png",
  "siege tower": "siege_workshop/Siegetower_aoe2DE.png",
  "siege towers": "siege_workshop/Siegetower_aoe2DE.png",
  "armored elephant": "siege_workshop/AoE2DE_Armored_Elephant_icon.png",
  "armored elephants": "siege_workshop/AoE2DE_Armored_Elephant_icon.png",
  monk: "monastery/Monk_aoe2DE.png",
  monks: "monastery/Monk_aoe2DE.png",
  "fishing ship": "dock/FishingShipDE.png",
  "fishing ships": "dock/FishingShipDE.png",
  galley: "dock/Galley_aoe2DE.png",
  galleys: "dock/Galley_aoe2DE.png",
  "fire galley": "dock/Fire_galley_aoe2DE.png",
  "fire galleys": "dock/Fire_galley_aoe2DE.png",
  "war galley": "dock/War_galley_aoe2DE.png",
  "war galleys": "dock/War_galley_aoe2DE.png",
  jaguarwarrior: "unique_unit/JaguarWarriorIcon-DE.png",
  "jaguar warrior": "unique_unit/JaguarWarriorIcon-DE.png",
  "jaguar warriors": "unique_unit/JaguarWarriorIcon-DE.png",
  ratha: "unique_unit/Aoe2de_ratha_ranged.png",
  camelarcher: "unique_unit/CamelArcherIcon-DE.png",
  "camel archer": "unique_unit/CamelArcherIcon-DE.png",
  "camel archers": "unique_unit/CamelArcherIcon-DE.png",
  genitour: "unique_unit/GenitourIcon-DE.png",
  genitours: "unique_unit/GenitourIcon-DE.png",
  hussitewagon: "unique_unit/Aoe2-icon-hussite-wagon.png",
  "hussite wagon": "unique_unit/Aoe2-icon-hussite-wagon.png",
  "hussite wagons": "unique_unit/Aoe2-icon-hussite-wagon.png",
  houfnice: "unique_unit/Aoe2-icon--houfnice.png",
  longbowman: "unique_unit/LongbowmanIcon-DE.png",
  longbowmen: "unique_unit/LongbowmanIcon-DE.png",
  konnik: "unique_unit/Konnikicon.png",
  konniks: "unique_unit/Konnikicon.png",
  coustillier: "unique_unit/Aoe2-icon-coustillier.png",
  coustilliers: "unique_unit/Aoe2-icon-coustillier.png",
  flemishmilitia: "unique_unit/Aoe2-icon-flemish-militia.png",
  "flemish militia": "unique_unit/Aoe2-icon-flemish-militia.png",
  "flemish militias": "unique_unit/Aoe2-icon-flemish-militia.png",
  arambai: "unique_unit/Arambaiicon-DE.png",
  arambais: "unique_unit/Arambaiicon-DE.png",
  cataphract: "unique_unit/CataphractIcon-DE.png",
  cataphracts: "unique_unit/CataphractIcon-DE.png",
  woadraider: "unique_unit/WoadRaiderIcon-DE.png",
  "woad raider": "unique_unit/WoadRaiderIcon-DE.png",
  "woad raiders": "unique_unit/WoadRaiderIcon-DE.png",
  chukonu: "unique_unit/ChukoNuIcon-DE.png",
  "chu ko nu": "unique_unit/ChukoNuIcon-DE.png",
  kipchak: "unique_unit/Kipchakicon.png",
  kipchaks: "unique_unit/Kipchakicon.png",
  urumiswordsman: "unique_unit/Aoe2de_Urumi.png",
  "urumi swordsman": "unique_unit/Aoe2de_Urumi.png",
  "urumi swordsmen": "unique_unit/Aoe2de_Urumi.png",
  thirisadai: "unique_unit/Aoe2de_Thirisadai.png",
  thirisadais: "unique_unit/Aoe2de_Thirisadai.png",
  shotelwarrior: "unique_unit/Shotelwarrioricon-DE.png",
  "shotel warrior": "unique_unit/Shotelwarrioricon-DE.png",
  "shotel warriors": "unique_unit/Shotelwarrioricon-DE.png",
  throwingaxeman: "unique_unit/ThrowingAxemanIcon-DE.png",
  "throwing axeman": "unique_unit/ThrowingAxemanIcon-DE.png",
  "throwing axemen": "unique_unit/ThrowingAxemanIcon-DE.png",
  huskarl: "unique_unit/HuskarlIcon-DE.png",
  huskarls: "unique_unit/HuskarlIcon-DE.png",
  chakramthrower: "unique_unit/Aoe2de_Chakram.png",
  "chakram thrower": "unique_unit/Aoe2de_Chakram.png",
  "chakram throwers": "unique_unit/Aoe2de_Chakram.png",
  shrivamsharider: "unique_unit/Aoe2de_shrivamsha_rider.png",
  "shrivamsha rider": "unique_unit/Aoe2de_shrivamsha_rider.png",
  "shrivamsha riders": "unique_unit/Aoe2de_shrivamsha_rider.png",
  camelscout: "unique_unit/Aoe2de_camel_scout.png",
  "camel scout": "unique_unit/Aoe2de_camel_scout.png",
  "camel scouts": "unique_unit/Aoe2de_camel_scout.png",
  ghulam: "unique_unit/Aoe2de_Ghulam.png",
  ghulams: "unique_unit/Aoe2de_Ghulam.png",
  imperialcamelrider: "unique_unit/ImperialCamelRiderIcon-DE.png",
  "imperial camel rider": "unique_unit/ImperialCamelRiderIcon-DE.png",
  "imperial camel riders": "unique_unit/ImperialCamelRiderIcon-DE.png",
  tarkan: "unique_unit/TarkanIcon-DE.png",
  tarkans: "unique_unit/TarkanIcon-DE.png",
  kamayuk: "unique_unit/KamayukIcon-DE.png",
  kamayuks: "unique_unit/KamayukIcon-DE.png",
  slinger: "unique_unit/SlingerIcon-DE.png",
  slingers: "unique_unit/SlingerIcon-DE.png",
  genoesecrossbowman: "unique_unit/GenoeseCrossbowmanIcon-DE.png",
  "genoese crossbowman": "unique_unit/GenoeseCrossbowmanIcon-DE.png",
  "genoese crossbowmen": "unique_unit/GenoeseCrossbowmanIcon-DE.png",
  condottiero: "unique_unit/CondottieroIcon-DE.png",
  samurai: "unique_unit/SamuraiIcon-DE.png",
  samurais: "unique_unit/SamuraiIcon-DE.png",
  ballistaelephant: "unique_unit/Ballistaelephanticon-DE.png",
  "ballista elephant": "unique_unit/Ballistaelephanticon-DE.png",
  "ballista elephants": "unique_unit/Ballistaelephanticon-DE.png",
  warwagon: "unique_unit/WarWagonIcon-DE.png",
  "war wagon": "unique_unit/WarWagonIcon-DE.png",
  "war wagons": "unique_unit/WarWagonIcon-DE.png",
  turtleship: "unique_unit/TurtleShipIcon-DE.png",
  "turtle ship": "unique_unit/TurtleShipIcon-DE.png",
  "turtle ships": "unique_unit/TurtleShipIcon-DE.png",
  leitis: "unique_unit/Leitisicon.png",
  wingedhussar: "stable/Winged-hussar_upgrade.png",
  "winged hussar": "stable/Winged-hussar_upgrade.png",
  "winged hussars": "stable/Winged-hussar_upgrade.png",
  magyarhuszar: "unique_unit/MagyarHuszarIcon-DE.png",
  "magyar huszar": "unique_unit/MagyarHuszarIcon-DE.png",
  "magyar huszars": "unique_unit/MagyarHuszarIcon-DE.png",
  karambitwarrior: "unique_unit/Karambitwarrioricon-DE.png",
  "karambit warrior": "unique_unit/Karambitwarrioricon-DE.png",
  "karambit warriors": "unique_unit/Karambitwarrioricon-DE.png",
  gbeto: "unique_unit/GbetoIcon-DE.png",
  plumedarcher: "unique_unit/PlumedArcherIcon-DE.png",
  "plumed archer": "unique_unit/PlumedArcherIcon-DE.png",
  "plumed archers": "unique_unit/PlumedArcherIcon-DE.png",
  mangudai: "unique_unit/MangudaiIcon-DE.png",
  mangudais: "unique_unit/MangudaiIcon-DE.png",
  warelephant: "unique_unit/WarElephantIcon-DE.png",
  "war elephant": "unique_unit/WarElephantIcon-DE.png",
  "war elephants": "unique_unit/WarElephantIcon-DE.png",
  obuch: "unique_unit/Aoe2-icon--obuch.png",
  organgun: "unique_unit/OrganGunIcon-DE.png",
  "organ gun": "unique_unit/OrganGunIcon-DE.png",
  "organ guns": "unique_unit/OrganGunIcon-DE.png",
  caravel: "unique_unit/CaravelIcon-DE.png",
  caravels: "unique_unit/CaravelIcon-DE.png",
  mameluke: "unique_unit/MamelukeIcon-DE.png",
  mamelukes: "unique_unit/MamelukeIcon-DE.png",
  serjeant: "unique_unit/Aoe2-icon-serjeant.png",
  serjeants: "unique_unit/Aoe2-icon-serjeant.png",
  boyar: "unique_unit/BoyarIcon-DE.png",
  boyars: "unique_unit/BoyarIcon-DE.png",
  conq: "unique_unit/ConquistadorIcon-DE.png",
  conqs: "unique_unit/ConquistadorIcon-DE.png",
  conquistador: "unique_unit/ConquistadorIcon-DE.png",
  conquistadors: "unique_unit/ConquistadorIcon-DE.png",
  missionary: "unique_unit/MissionaryIcon-DE.png",
  missionaries: "unique_unit/MissionaryIcon-DE.png",
  keshik: "unique_unit/Keshikicon.png",
  keshiks: "unique_unit/Keshikicon.png",
  flamingcamel: "unique_unit/Flaming_camel_icon.png",
  "flaming camel": "unique_unit/Flaming_camel_icon.png",
  "flaming camels": "unique_unit/Flaming_camel_icon.png",
  teutonicknight: "unique_unit/TeutonicKnightIcon-DE.png",
  "teutonic knight": "unique_unit/TeutonicKnightIcon-DE.png",
  "teutonic knights": "unique_unit/TeutonicKnightIcon-DE.png",
  janissary: "unique_unit/JanissaryIcon-DE.png",
  janissaries: "unique_unit/JanissaryIcon-DE.png",
  rattanarcher: "unique_unit/Rattanarchericon-DE.png",
  "rattan archer": "unique_unit/Rattanarchericon-DE.png",
  "rattan archers": "unique_unit/Rattanarchericon-DE.png",
  berserk: "unique_unit/BerserkIcon-DE.png",
  berserks: "unique_unit/BerserkIcon-DE.png",
  longboat: "unique_unit/LongboatIcon-DE.png",
  longboats: "unique_unit/LongboatIcon-DE.png",
  longship: "unique_unit/LongboatIcon-DE.png",
  longships: "unique_unit/LongboatIcon-DE.png",
};

/**
 * Reemplaza por íconos (`@ruta@`) los tramos de hasta `maxSize` palabras que estén en el
 * diccionario, empezando por los más largos (convertTxtToIllustrated del original).
 */
export function illustrate(note: string, maxSize = 3): string {
  const words = note.split(" ");
  if (words.length < 1) return "";
  const start = maxSize < 1 ? words.length : maxSize;
  for (let size = start; size > 0; size--) {
    for (let first = 0; first + size <= words.length; first++) {
      const key = words
        .slice(first, first + size)
        .join(" ")
        .toLowerCase();
      const icon = IMAGES[key];
      if (!icon) continue;
      const before = words.slice(0, first).join(" ");
      const after = words.slice(first + size).join(" ");
      return [
        before && illustrate(before, maxSize),
        `@${icon}@`,
        after && illustrate(after, maxSize),
      ]
        .filter(Boolean)
        .join(" ");
    }
  }
  return note;
}

function stepText(step: BogStep): string {
  switch (step.type) {
    case "newVillagers":
      return `Create ${step.count} villagers on ${step.task}`;
    case "moveVillagers":
      return `Move ${step.count} villagers from ${step.from} to ${step.to}`;
    case "lure":
      return `Lure ${step.count} ${step.animal}`;
    case "research":
      return `Research ${(step.tech ?? []).join(", ")}`;
    case "ageUp":
      return `Click up to ${step.age}`;
    case "newAge":
      return `Reach ${step.age}`;
    case "build":
      return `Build ${(step.buildings ?? []).map((b) => `${b.count} ${b.type}`).join(", ")}`;
    case "custom":
      return step.text ?? "";
    case "trade":
      return `${step.action === "buy" ? "Buy" : "Sell"} ${step.count} ${step.resource}`;
    case "trainUnit":
      return `Train ${step.count} ${step.unit}`;
    case "collectGold":
      return `Collect ${step.count} gold with ${step.task}`;
    case "decision":
      return `Decision: ${step.text}`;
    default:
      return "Unknown step";
  }
}

const AGE_ICONS: Record<number, string> = {
  1: "@age/DarkAgeIconDE_alpha.png@",
  2: "@age/FeudalAgeIconDE_alpha.png@",
  3: "@age/CastleAgeIconDE_alpha.png@",
  4: "@age/ImperialAgeIconDE_alpha.png@",
};
const AGE_IDS: Record<string, number> = { darkAge: 1, feudalAge: 2, castleAge: 3, imperialAge: 4 };

const DIFFICULTY: Record<number, "beginner" | "intermediate" | "advanced"> = {
  1: "beginner",
  2: "intermediate",
  3: "advanced",
};

/** Civilización de Build Order Guide → la del formato del overlay. */
function civilizationOf(civ: string | undefined): string | string[] {
  if (!civ || civ === "Generic") return "Any";
  // Los nombres de las civs americanas siguen los de este proyecto ("Mayans", "Incas").
  if (civ === "Meso") return ["Aztecs", "Mayans"];
  if (civ === "South American") return ["Mapuche", "Muisca", "Tupi", "Incas"];
  if (civ === "Maya") return "Mayans";
  if (civ === "Inca") return "Incas";
  return civ;
}

interface OverlayStep {
  villager_count: number;
  age: number;
  resources: { wood: number; food: number; gold: number; stone: number; builder?: number };
  notes: string[];
}

/** Build de Build Order Guide → estrategia en el formato del overlay (sin validar). */
export function toOverlayStrategy(build: BogBuild): Record<string, unknown> {
  const steps: OverlayStep[] = [];
  let currentAge = 1;
  let previous: Record<string, number> | null = null;
  let ageUpFlag = false;
  let newAgeFlag = false;
  let newStepAge = false;

  for (const step of build.build ?? []) {
    if (step.type === "newAge") {
      ageUpFlag = false;
      newAgeFlag = true;
      newStepAge = true;
      continue;
    }

    const r = step.resources ?? {};
    const res = {
      wood: r.wood ?? -1,
      food: r.food ?? -1,
      gold: r.gold ?? -1,
      stone: r.stone ?? -1,
      builder: r.build ? r.build : -1,
    };
    const villagers = Object.values(res).reduce((sum, v) => sum + Math.max(0, v), 0);
    const raw = step.type === "decision" ? (step.text ?? "") : stepText(step).trim();
    const note = illustrate(raw, 3);

    let usePrevious: boolean;
    let ageNote = "";
    if (ageUpFlag || newAgeFlag) {
      usePrevious = steps.length >= 1 && !newStepAge;
      ageNote = `${ageUpFlag ? "Before " : "In "}${AGE_ICONS[currentAge] ?? "Unknown age"}`;
      newStepAge = false;
    } else {
      usePrevious =
        steps.length >= 1 &&
        previous !== null &&
        (["wood", "food", "gold", "stone", "builder"] as const).every(
          (k) => res[k] === previous![k],
        );
    }

    // Los recursos sin dato (-1) se guardan como 0: el esquema del overlay no admite negativos.
    const stored: OverlayStep["resources"] = {
      wood: Math.max(0, res.wood),
      food: Math.max(0, res.food),
      gold: Math.max(0, res.gold),
      stone: Math.max(0, res.stone),
      ...(res.builder > 0 && { builder: res.builder }),
    };

    const last = steps[steps.length - 1];
    if (usePrevious && last) {
      last.villager_count = villagers;
      last.age = currentAge;
      last.resources = stored;
      last.notes.push(note);
    } else {
      steps.push({
        villager_count: villagers,
        age: currentAge,
        resources: stored,
        notes: [ageNote, note].filter(Boolean),
      });
    }

    previous = res;
    if (step.type === "ageUp") {
      ageUpFlag = true;
      newStepAge = true;
      currentAge = AGE_IDS[step.age ?? ""] ?? currentAge;
    }
    newAgeFlag = false;
  }

  const difficulty = build.difficulty ? DIFFICULTY[build.difficulty] : undefined;
  return {
    name: (build.title ?? "").trim() || "Sin nombre",
    civilization: civilizationOf(build.civilization),
    author: (build.author ?? "").trim() || "Build Order Guide",
    source: bogBuildUrl(build.id),
    ...(build.description?.trim() && { description: build.description.trim() }),
    ...(difficulty && { difficulty }),
    ...(build.attributes?.length && { tags: build.attributes }),
    build_order: steps,
  };
}

// ---------------------------------------------------------------------------------------------
// Selección

/** Puntaje bayesiano: una sola calificación de 5 no le gana a 20 de 4,5. */
export function bogScore(build: BogBuild, prior = 3, weight = 3): number {
  const n = build.number_of_ratings ?? 0;
  const avg = build.avg_rating ?? 0;
  return (avg * n + prior * weight) / (n + weight);
}

export interface SelectOptions {
  /** Cuántas por civilización (las genéricas cuentan como una civ más). */
  perCiv: number;
  /** Calificaciones mínimas para entrar. */
  minRatings: number;
  /** Puntaje mínimo (`bogScore`); con el valor por defecto quedan afuera las de menos de 3★. */
  minScore?: number;
  /**
   * Si una civ no tiene ninguna con `minRatings`, se completa con su mejor build que tenga al
   * menos una calificación (y el puntaje mínimo).
   */
  fill?: boolean;
  /** "nombre|autor" en minúsculas de estrategias que ya están en el catálogo. */
  skip?: Set<string>;
}

export const nameAuthorKey = (name: string, author: string) =>
  `${name
    .replace(/^[\s:;,.|–—-]+/, "")
    .trim()
    .toLowerCase()}|${author.trim().toLowerCase()}`;

/** Las mejores builds por civilización, de mayor a menor puntaje. */
export function selectBest(builds: BogBuild[], options: SelectOptions): BogBuild[] {
  const minScore = options.minScore ?? 3;
  const byCiv = new Map<string, BogBuild[]>();
  for (const b of builds) {
    if ((b.number_of_ratings ?? 0) < 1 || bogScore(b) < minScore) continue;
    if (!b.build?.length || !b.title?.trim()) continue;
    if (options.skip?.has(nameAuthorKey(b.title, b.author ?? ""))) continue;
    const civ = b.civilization || "Generic";
    byCiv.set(civ, [...(byCiv.get(civ) ?? []), b]);
  }
  return [...byCiv.values()].flatMap((list) => {
    const ranked = list.sort((a, b) => bogScore(b) - bogScore(a));
    const rated = ranked.filter((b) => (b.number_of_ratings ?? 0) >= options.minRatings);
    if (rated.length) return rated.slice(0, options.perCiv);
    return options.fill ? ranked.slice(0, 1) : [];
  });
}
