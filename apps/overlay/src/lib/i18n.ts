/**
 * Textos del overlay en español e inglés. El idioma se elige en Ajustes; la primera vez
 * se toma el del sistema (español si empieza con "es", si no inglés).
 *
 * `{nombre}` dentro de un texto se reemplaza con `t("clave", { nombre: "…" })`.
 */
import { createContext, useCallback, useContext } from "react";

export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABELS: Record<Lang, string> = { es: "Español", en: "English" };

const es = {
  // Barra superior
  "tab.match": "Partida",
  "tab.settings": "Ajustes",
  "title.updateAvailable": "Versión {version} disponible",
  "title.hide": "Ocultar",
  "avatar.in": "Conectado como {name}",
  "avatar.inAria": "Cuenta: {name}",
  "avatar.out": "Sin sesión: iniciar sesión o registrarse",
  "avatar.outAria": "Iniciar sesión o registrarse",

  // Edades
  "age.1": "Alta Edad Media",
  "age.2": "Feudal",
  "age.3": "Castillos",
  "age.4": "Imperial",
  "ageFull.1": "Alta Edad Media",
  "ageFull.2": "Edad Feudal",
  "ageFull.3": "Edad de los Castillos",
  "ageFull.4": "Edad Imperial",

  // Pestaña Partida
  "sync.syncing": "Sincronizando estrategias…",
  "sync.ok": "✓ {count} estrategias · sincronizado {ago}",
  "sync.offline": "Sin conexión: usando {count} estrategias guardadas",
  "sync.idle": "{count} estrategias",
  "ago.now": "recién",
  "ago.min": "hace {n} min",
  "ago.hours": "hace {n} h",
  "ago.days": "hace {n} días",
  "position.1v1": "1 contra 1",
  "position.flank": "Flanco",
  "position.pocket": "Bolsillo (pocket)",
  "setup.map": "Mapa",
  "setup.civ": "Mi civilización",
  "setup.vsCiv": "Rival",
  "setup.position": "Posición",
  "setup.any": "— Cualquiera —",
  "setup.dontKnow": "— No sé —",
  "setup.suggestions": "Sugerencias",
  "setup.results": "Resultados",
  "setup.search": "Buscar por nombre…",
  "setup.searchReason": "búsqueda",
  "setup.general": "general",
  "setup.steps": "{n} pasos",
  "setup.none": "No hay estrategias para esa combinación.",
  "setup.favLogin": "Iniciá sesión para guardar favoritas",
  "setup.favRemove": "Quitar de favoritas",
  "setup.favAdd": "Agregar a favoritas",
  "setup.previewHide": "Ocultar pasos",
  "setup.previewShow": "Ver todos los pasos",
  "setup.playThis": "Jugar: {name}",
  "setup.play": "▶ Jugar con esta estrategia",
  "setup.playNamed": "▶ Jugar: {name}",
  "detect.won": "🏆 Victoria en la última partida",
  "detect.lost": "Derrota en la última partida",
  "detect.reported": " · reportada",
  "detect.ongoing": "🎮 Partida en curso",
  "detect.waiting": "🔎 Esperando la próxima partida de {name}",
  "detect.yourProfile": "tu perfil",

  // Modo juego
  "game.prevStep": "Paso anterior ({key})",
  "game.minus5": "Atrasar 5 s ({key})",
  "game.pause": "Pausar ({key})",
  "game.start": "Iniciar ({key})",
  "game.plus5": "Adelantar 5 s ({key})",
  "game.nextStep": "Paso siguiente ({key})",
  "game.editMode": "Modo edición ({key})",
  "game.hide": "Ocultar ({key}). Para salir: ícono de la bandeja",
  "game.noStrategy": "No hay estrategia elegida.",
  "game.pickHint": "Tocá ⚙ o {key} para elegir una",
  "game.popTitle": "Población total: aldeanos + explorador inicial",
  "game.popDetail": " ({n} ald. + explorador)",
  "game.nextIn": "Siguiente en",
  "game.pop": "pob.",
  "game.startHint": "Tocá ▶ o {key} al empezar la partida",
  "res.wood": "Madera",
  "res.food": "Comida",
  "res.gold": "Oro",
  "res.stone": "Piedra",
  "res.builder": "Construyendo",

  // Ajustes
  "settings.account": "Cuenta",
  "settings.match": "Partida",
  "settings.language": "Idioma",
  "settings.speed": "Velocidad de la partida",
  "speed.slow": "Lenta (1.0)",
  "speed.casual": "Casual (1.5)",
  "speed.normal": "Normal (1.7)",
  "speed.fast": "Rápida (2.0)",
  "settings.opacity": "Opacidad del fondo: {n}%",
  "settings.scale": "Tamaño del texto: {n}%",
  "settings.sound": "Sonido al cambiar de paso",
  "settings.screen": "Pantalla",
  "settings.layout": "Diseño durante la partida",
  "layout.normal": "Normal: paso actual y siguiente",
  "layout.compact": "Compacto: solo el paso actual",
  "layout.detailed": "Detallado: nombre y los próximos 3 pasos",
  "settings.corner": "Esquina",
  "corner.top-right": "Arriba a la derecha",
  "corner.top-left": "Arriba a la izquierda",
  "corner.bottom-right": "Abajo a la derecha",
  "corner.bottom-left": "Abajo a la izquierda",
  "settings.monitor": "Monitor",
  "settings.primaryMonitor": "El principal",
  "settings.primarySuffix": " · principal",
  "settings.resetPosition": "Volver a la esquina",
  "settings.hotkeys": "Atajos de teclado",
  "settings.hotkeysHelp": "Funcionan aunque el juego tenga el foco. Formato:",
  "settings.hotkeyError": "No se pudo registrar: {message}",
  "settings.resetHotkeys": "Restaurar atajos",
  "settings.community": "Estrategias de la comunidad",
  "settings.syncNow": "Sincronizar ahora",
  "settings.app": "Aplicación",
  "settings.quit": "Salir de AoE2 Overlay",
  "hotkey.toggleMode": "Modo edición / juego",
  "hotkey.startPause": "Iniciar / pausar reloj",
  "hotkey.reset": "Reiniciar reloj",
  "hotkey.plus5": "Adelantar 5 s",
  "hotkey.minus5": "Atrasar 5 s",
  "hotkey.nextStep": "Paso siguiente",
  "hotkey.prevStep": "Paso anterior",
  "hotkey.toggleVisible": "Mostrar / ocultar",

  // Detección automática
  "detectSettings.title": "Detección automática",
  "detectSettings.help":
    "Con tu perfil de AoE2 Companion, el overlay detecta cuándo empezás una partida: elige mapa, civs y estrategia, y arranca el reloj. No lee nada del juego, solo tu historial público.",
  "detectSettings.player": "Jugador:",
  "detectSettings.remove": "Quitar",
  "detectSettings.placeholder": "Tu nombre en el juego",
  "detectSettings.search": "Buscar",
  "detectSettings.notFound": "No se encontró ningún jugador con ese nombre.",
  "detectSettings.games": " · {n} partidas",
  "detectSettings.autoStart": "Arrancar el reloj solo al empezar la partida",
  "detectSettings.autoReport": "Reportar si gané o perdí (winrate de la estrategia)",
  "detectSettings.needsLogin": " · necesita iniciar sesión",

  // Cuenta
  "account.connected": "Conectado como {name}.",
  "account.connectedHelp":
    "Tocá la ★ de una estrategia para marcarla como favorita: aparecen primero.",
  "account.logout": "Cerrar sesión",
  "account.waitingOpened": "Se abrió la web para confirmar. Si no se abrió, entrá a",
  "account.waitingCode": "y escribí este código:",
  "account.waiting": "Esperando la confirmación…",
  "account.reopen": "Abrir la web de nuevo",
  "account.cancel": "Cancelar",
  "account.optional":
    "Opcional: iniciá sesión para guardar tus estrategias favoritas. Si no tenés cuenta, la creás en la web en el mismo paso.",
  "account.login": "Iniciar sesión",
  "account.tokenRejected": "La API no aceptó el token.",
  "account.expired": "El código venció. Probá de nuevo.",

  // Actualizaciones
  "update.available": "Hay una versión nueva:",
  "update.error": "No se pudo actualizar. Probá de nuevo o bajala desde la web.",
  "update.downloading": "Descargando…",
  "update.install": "Actualizar y reiniciar",
  "update.notInGame": "No la instales en medio de una partida: el overlay se cierra un momento.",
} as const;

export type TKey = keyof typeof es;

const en: Record<TKey, string> = {
  "tab.match": "Match",
  "tab.settings": "Settings",
  "title.updateAvailable": "Version {version} available",
  "title.hide": "Hide",
  "avatar.in": "Signed in as {name}",
  "avatar.inAria": "Account: {name}",
  "avatar.out": "Not signed in: sign in or sign up",
  "avatar.outAria": "Sign in or sign up",

  "age.1": "Dark Age",
  "age.2": "Feudal",
  "age.3": "Castle",
  "age.4": "Imperial",
  "ageFull.1": "Dark Age",
  "ageFull.2": "Feudal Age",
  "ageFull.3": "Castle Age",
  "ageFull.4": "Imperial Age",

  "sync.syncing": "Syncing strategies…",
  "sync.ok": "✓ {count} strategies · synced {ago}",
  "sync.offline": "Offline: using {count} saved strategies",
  "sync.idle": "{count} strategies",
  "ago.now": "just now",
  "ago.min": "{n} min ago",
  "ago.hours": "{n} h ago",
  "ago.days": "{n} days ago",
  "position.1v1": "1 vs 1",
  "position.flank": "Flank",
  "position.pocket": "Pocket",
  "setup.map": "Map",
  "setup.civ": "My civilization",
  "setup.vsCiv": "Opponent",
  "setup.position": "Position",
  "setup.any": "— Any —",
  "setup.dontKnow": "— Unknown —",
  "setup.suggestions": "Suggestions",
  "setup.results": "Results",
  "setup.search": "Search by name…",
  "setup.searchReason": "search",
  "setup.general": "general",
  "setup.steps": "{n} steps",
  "setup.none": "No strategies for that combination.",
  "setup.favLogin": "Sign in to save favorites",
  "setup.favRemove": "Remove from favorites",
  "setup.favAdd": "Add to favorites",
  "setup.previewHide": "Hide steps",
  "setup.previewShow": "Show all steps",
  "setup.playThis": "Play: {name}",
  "setup.play": "▶ Play this strategy",
  "setup.playNamed": "▶ Play: {name}",
  "detect.won": "🏆 Won the last match",
  "detect.lost": "Lost the last match",
  "detect.reported": " · reported",
  "detect.ongoing": "🎮 Match in progress",
  "detect.waiting": "🔎 Waiting for {name}'s next match",
  "detect.yourProfile": "your profile",

  "game.prevStep": "Previous step ({key})",
  "game.minus5": "Back 5 s ({key})",
  "game.pause": "Pause ({key})",
  "game.start": "Start ({key})",
  "game.plus5": "Forward 5 s ({key})",
  "game.nextStep": "Next step ({key})",
  "game.editMode": "Edit mode ({key})",
  "game.hide": "Hide ({key}). To quit: tray icon",
  "game.noStrategy": "No strategy selected.",
  "game.pickHint": "Press ⚙ or {key} to pick one",
  "game.popTitle": "Total population: villagers + starting scout",
  "game.popDetail": " ({n} vils + scout)",
  "game.nextIn": "Next in",
  "game.pop": "pop.",
  "game.startHint": "Press ▶ or {key} when the match starts",
  "res.wood": "Wood",
  "res.food": "Food",
  "res.gold": "Gold",
  "res.stone": "Stone",
  "res.builder": "Building",

  "settings.account": "Account",
  "settings.match": "Match",
  "settings.language": "Language",
  "settings.speed": "Game speed",
  "speed.slow": "Slow (1.0)",
  "speed.casual": "Casual (1.5)",
  "speed.normal": "Normal (1.7)",
  "speed.fast": "Fast (2.0)",
  "settings.opacity": "Background opacity: {n}%",
  "settings.scale": "Text size: {n}%",
  "settings.sound": "Sound on step change",
  "settings.screen": "Display",
  "settings.layout": "In-game layout",
  "layout.normal": "Normal: current and next step",
  "layout.compact": "Compact: current step only",
  "layout.detailed": "Detailed: name and the next 3 steps",
  "settings.corner": "Corner",
  "corner.top-right": "Top right",
  "corner.top-left": "Top left",
  "corner.bottom-right": "Bottom right",
  "corner.bottom-left": "Bottom left",
  "settings.monitor": "Monitor",
  "settings.primaryMonitor": "Primary",
  "settings.primarySuffix": " · primary",
  "settings.resetPosition": "Back to the corner",
  "settings.hotkeys": "Keyboard shortcuts",
  "settings.hotkeysHelp": "They work even while the game has focus. Format:",
  "settings.hotkeyError": "Could not register: {message}",
  "settings.resetHotkeys": "Restore shortcuts",
  "settings.community": "Community strategies",
  "settings.syncNow": "Sync now",
  "settings.app": "Application",
  "settings.quit": "Quit AoE2 Overlay",
  "hotkey.toggleMode": "Edit / game mode",
  "hotkey.startPause": "Start / pause clock",
  "hotkey.reset": "Reset clock",
  "hotkey.plus5": "Forward 5 s",
  "hotkey.minus5": "Back 5 s",
  "hotkey.nextStep": "Next step",
  "hotkey.prevStep": "Previous step",
  "hotkey.toggleVisible": "Show / hide",

  "detectSettings.title": "Automatic detection",
  "detectSettings.help":
    "With your AoE2 Companion profile, the overlay detects when you start a match: it picks map, civs and strategy, and starts the clock. It doesn't read anything from the game, only your public match history.",
  "detectSettings.player": "Player:",
  "detectSettings.remove": "Remove",
  "detectSettings.placeholder": "Your in-game name",
  "detectSettings.search": "Search",
  "detectSettings.notFound": "No player found with that name.",
  "detectSettings.games": " · {n} matches",
  "detectSettings.autoStart": "Start the clock automatically when the match begins",
  "detectSettings.autoReport": "Report whether I won or lost (strategy winrate)",
  "detectSettings.needsLogin": " · requires signing in",

  "account.connected": "Signed in as {name}.",
  "account.connectedHelp": "Tap a strategy's ★ to mark it as a favorite: favorites show up first.",
  "account.logout": "Sign out",
  "account.waitingOpened": "The website opened to confirm. If it didn't, go to",
  "account.waitingCode": "and enter this code:",
  "account.waiting": "Waiting for confirmation…",
  "account.reopen": "Open the website again",
  "account.cancel": "Cancel",
  "account.optional":
    "Optional: sign in to save your favorite strategies. If you don't have an account, you create it on the website in the same step.",
  "account.login": "Sign in",
  "account.tokenRejected": "The API didn't accept the token.",
  "account.expired": "The code expired. Try again.",

  "update.available": "A new version is available:",
  "update.error": "Couldn't update. Try again or download it from the website.",
  "update.downloading": "Downloading…",
  "update.install": "Update and restart",
  "update.notInGame": "Don't install it mid-match: the overlay closes for a moment.",
};

const DICTS: Record<Lang, Record<TKey, string>> = { es, en };

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  const text = DICTS[lang][key] ?? es[key];
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m)) : text;
}

/** Idioma del sistema: español si empieza con "es", si no inglés. */
export function systemLang(): Lang {
  const l = typeof navigator === "undefined" ? "es" : navigator.language;
  return l.toLowerCase().startsWith("es") ? "es" : "en";
}

export const LangContext = createContext<Lang>("es");

export type T = (key: TKey, vars?: Vars) => string;

/** `const t = useT(); t("tab.match")` */
export function useT(): T {
  const lang = useContext(LangContext);
  return useCallback((key: TKey, vars?: Vars) => translate(lang, key, vars), [lang]);
}

export function useLang(): Lang {
  return useContext(LangContext);
}
