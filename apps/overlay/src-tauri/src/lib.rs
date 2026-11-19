//! Parte nativa del overlay: ventana transparente encima del juego, modo click-through,
//! zonas clickeables (botones) en modo juego, mostrar sin robar el foco, recordar la
//! posición (esquina y monitor elegibles), ícono en la bandeja del sistema y links `ageoverlay://` desde la web.
//!
//! La lógica (reloj, estrategias, hotkeys, sincronización) vive en el frontend (React).

use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager, Monitor, PhysicalPosition, WebviewWindow};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

/// Margen (en píxeles lógicos) respecto del borde de la pantalla.
const MARGIN: f64 = 16.0;
/// Cada cuánto se revisa si el mouse está sobre los botones en modo juego.
const HIT_TEST_INTERVAL: Duration = Duration::from_millis(40);
/// Se guarda solo posición y tamaño (la visibilidad la maneja la app).
fn window_state_flags() -> StateFlags {
    StateFlags::POSITION | StateFlags::SIZE
}

/// Rectángulo en píxeles CSS, relativo al área de la ventana.
#[derive(Debug, Clone, Copy, Deserialize)]
struct Rect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

impl Rect {
    fn contains(&self, x: f64, y: f64) -> bool {
        x >= self.x && x <= self.x + self.w && y >= self.y && y <= self.y + self.h
    }
}

/// Estado del "hit test": en modo juego la ventana deja pasar los clics al juego,
/// salvo cuando el mouse está sobre alguna zona interactiva (los botones).
#[derive(Default)]
struct HitTest {
    game_mode: bool,
    rects: Vec<Rect>,
    /// Último valor aplicado a `set_ignore_cursor_events`.
    ignoring: Option<bool>,
}

struct HitTestState(Mutex<HitTest>);

/// Muestra la ventana usando siempre la API de Tauri/tao.
///
/// Importante: no usar ShowWindow/SetWindowLong directo. tao guarda los estilos de la
/// ventana en su propio estado y los vuelve a aplicar en cada cambio (click-through,
/// siempre encima…): si la ventana se mostró "por fuera", tao cree que está oculta y la
/// vuelve a esconder. En modo juego la ventana es no enfocable (WS_EX_NOACTIVATE vía
/// `set_focusable(false)`), así que mostrarla no le quita el foco al juego.
fn show_without_focus(window: &WebviewWindow) {
    let _ = window.show();
    let _ = window.set_always_on_top(true);
}

fn toggle_window(window: &WebviewWindow) -> bool {
    let visible = window.is_visible().unwrap_or(false);
    if visible {
        let _ = window.hide();
    } else {
        show_without_focus(window);
    }
    !visible
}

/// Esquina de la pantalla donde se ubica el overlay.
#[derive(Debug, Clone, Copy, Default, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
enum Corner {
    #[default]
    TopRight,
    TopLeft,
    BottomRight,
    BottomLeft,
}

/// Dónde se ubica el overlay: esquina y monitor (índice de `available_monitors`;
/// `None` = el principal). Lo elige el usuario en Ajustes.
#[derive(Debug, Clone, Copy, Default, Deserialize)]
struct Placement {
    corner: Corner,
    monitor: Option<usize>,
}

struct PlacementState(Mutex<Placement>);

/// Monitor elegido; si ya no está conectado, el principal.
fn target_monitor(window: &WebviewWindow, index: Option<usize>) -> tauri::Result<Option<Monitor>> {
    if let Some(i) = index {
        if let Some(m) = window.available_monitors()?.into_iter().nth(i) {
            return Ok(Some(m));
        }
    }
    window.primary_monitor()
}

/// Ubica la ventana en la esquina elegida (arriba a la derecha del principal por defecto).
fn place(window: &WebviewWindow, placement: Placement) -> tauri::Result<()> {
    let Some(monitor) = target_monitor(window, placement.monitor)? else {
        return Ok(());
    };
    let scale = monitor.scale_factor();
    let margin = (MARGIN * scale).round() as i32;
    let area = monitor.size();
    let origin = monitor.position();
    let size = window.outer_size()?;
    let left = origin.x + margin;
    let right = origin.x + area.width as i32 - size.width as i32 - margin;
    let top = origin.y + margin;
    let bottom = origin.y + area.height as i32 - size.height as i32 - margin;
    let (x, y) = match placement.corner {
        Corner::TopRight => (right, top),
        Corner::TopLeft => (left, top),
        Corner::BottomRight => (right, bottom),
        Corner::BottomLeft => (left, bottom),
    };
    window.set_position(PhysicalPosition::new(x, y))
}

fn saved_placement(app: &AppHandle) -> Placement {
    app.state::<PlacementState>()
        .0
        .lock()
        .map(|p| *p)
        .unwrap_or_default()
}

/// Nombre de un monitor para mostrar en Ajustes.
#[derive(Debug, Serialize)]
struct MonitorInfo {
    index: usize,
    name: String,
    width: u32,
    height: u32,
    primary: bool,
}

fn main_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window("main")
}

/// Modo juego: los clics atraviesan la ventana (salvo en los botones) y nunca toma el foco.
/// Modo edición: la ventana es interactiva (para elegir estrategia y configurar).
#[tauri::command]
fn set_game_mode(
    window: WebviewWindow,
    state: tauri::State<HitTestState>,
    enabled: bool,
) -> Result<(), String> {
    window
        .set_ignore_cursor_events(enabled)
        .map_err(|e| e.to_string())?;
    {
        let mut hit = state.0.lock().map_err(|e| e.to_string())?;
        hit.game_mode = enabled;
        hit.ignoring = Some(enabled);
    }
    // No enfocable en modo juego: el teclado sigue yendo al juego, incluso al tocar botones.
    window.set_focusable(!enabled).map_err(|e| e.to_string())?;
    if !enabled {
        let _ = window.set_focus();
    }
    Ok(())
}

/// Zonas clickeables en modo juego (en píxeles CSS relativos a la ventana).
#[tauri::command]
fn set_interactive_rects(state: tauri::State<HitTestState>, rects: Vec<Rect>) -> Result<(), String> {
    state.0.lock().map_err(|e| e.to_string())?.rects = rects;
    Ok(())
}

/// El frontend la llama cuando terminó de cargar: así no se ve un parpadeo en blanco
/// y la ventana ya existe del todo (mostrarla desde `setup` es demasiado temprano).
#[tauri::command]
fn show_overlay(window: WebviewWindow) {
    show_without_focus(&window);
}

/// Muestra u oculta el overlay. Devuelve si quedó visible.
#[tauri::command]
fn toggle_visibility(window: WebviewWindow) -> bool {
    toggle_window(&window)
}

/// Vuelve a la esquina y al monitor elegidos.
#[tauri::command]
fn reset_position(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    place(&window, saved_placement(&app)).map_err(|e| e.to_string())
}

/// Guarda la esquina y el monitor elegidos. Con `apply`, además mueve la ventana ahí.
#[tauri::command]
fn set_placement(
    window: WebviewWindow,
    state: tauri::State<PlacementState>,
    placement: Placement,
    apply: bool,
) -> Result<(), String> {
    *state.0.lock().map_err(|e| e.to_string())? = placement;
    if apply {
        place(&window, placement).map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Monitores conectados, para elegir en cuál se muestra el overlay.
#[tauri::command]
fn list_monitors(window: WebviewWindow) -> Result<Vec<MonitorInfo>, String> {
    let primary = window
        .primary_monitor()
        .map_err(|e| e.to_string())?
        .map(|m| *m.position());
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;
    Ok(monitors
        .into_iter()
        .enumerate()
        .map(|(index, m)| MonitorInfo {
            index,
            name: m.name().cloned().unwrap_or_else(|| format!("Monitor {}", index + 1)),
            width: m.size().width,
            height: m.size().height,
            primary: primary == Some(*m.position()),
        })
        .collect())
}

/// Cierra la app guardando posición y tamaño de la ventana.
#[tauri::command]
fn quit_app(app: AppHandle) {
    quit(&app);
}

fn quit(app: &AppHandle) {
    let _ = app.save_window_state(window_state_flags());
    app.exit(0);
}

/// Hilo que, en modo juego, activa los clics solo cuando el mouse está sobre los botones.
fn spawn_hit_test(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(HIT_TEST_INTERVAL);
        let Some(window) = main_window(&app) else {
            continue;
        };
        let state = app.state::<HitTestState>();
        let (game_mode, rects, ignoring) = match state.0.lock() {
            Ok(h) => (h.game_mode, h.rects.clone(), h.ignoring),
            Err(_) => continue,
        };
        if !game_mode {
            continue;
        }
        let over_controls = match (
            window.cursor_position(),
            window.inner_position(),
            window.scale_factor(),
        ) {
            (Ok(cursor), Ok(origin), Ok(scale)) => {
                let x = (cursor.x - origin.x as f64) / scale;
                let y = (cursor.y - origin.y as f64) / scale;
                rects.iter().any(|r| r.contains(x, y))
            }
            _ => false,
        };
        let want_ignore = !over_controls;
        if ignoring != Some(want_ignore) && window.set_ignore_cursor_events(want_ignore).is_ok() {
            if let Ok(mut h) = state.0.lock() {
                // Puede haber salido del modo juego mientras tanto.
                if h.game_mode {
                    h.ignoring = Some(want_ignore);
                }
            }
        }
    });
}

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", "Mostrar / ocultar", true, None::<&str>)?;
    let mode = MenuItem::with_id(app, "mode", "Modo edición / juego", true, None::<&str>)?;
    let corner = MenuItem::with_id(app, "corner", "Volver a la esquina", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &mode, &corner, &quit_item])?;

    let mut tray = TrayIconBuilder::with_id("main")
        .tooltip("AoE2 Overlay")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                if let Some(w) = main_window(app) {
                    toggle_window(&w);
                }
            }
            "mode" => {
                let _ = app.emit("overlay://toggle-mode", ());
            }
            "corner" => {
                if let Some(w) = main_window(app) {
                    let _ = place(&w, saved_placement(app));
                }
            }
            "quit" => quit(app),
            _ => {}
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Tiene que ser el primer plugin: si ya hay una instancia abierta, la muestra y sale.
        // Con la feature "deep-link", un link `ageoverlay://…` abierto con la app ya corriendo
        // llega a esta instancia (evento de deep-link) en vez de abrir otra.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = main_window(app) {
                show_without_focus(&w);
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        // Actualizaciones: lee latest.json del último release de GitHub (firmado).
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(window_state_flags())
                .build(),
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(HitTestState(Mutex::new(HitTest::default())))
        .manage(PlacementState(Mutex::new(Placement::default())))
        .invoke_handler(tauri::generate_handler![
            set_game_mode,
            set_interactive_rects,
            show_overlay,
            toggle_visibility,
            reset_position,
            set_placement,
            list_monitors,
            quit_app
        ])
        .setup(|app| {
            build_tray(app.handle())?;
            // El instalador registra el esquema `ageoverlay://`; en desarrollo se registra acá.
            #[cfg(debug_assertions)]
            {
                let _ = app.deep_link().register_all();
            }
            // Al abrir una estrategia desde la web, mostrar el overlay (el frontend la elige).
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |_event| {
                if let Some(w) = main_window(&handle) {
                    show_without_focus(&w);
                }
            });
            // Si no hay posición guardada (primera vez), arriba a la derecha del principal.
            let saved = app
                .path()
                .app_config_dir()
                .map(|d| d.join(tauri_plugin_window_state::DEFAULT_FILENAME).exists())
                .unwrap_or(false);
            if !saved {
                if let Some(w) = main_window(app.handle()) {
                    place(&w, Placement::default())?;
                }
            }
            spawn_hit_test(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar AoE2 Overlay");
}
