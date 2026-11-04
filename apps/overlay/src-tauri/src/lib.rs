//! Parte nativa del overlay: ventana transparente encima del juego, modo click-through,
//! zonas clickeables (botones) en modo juego, mostrar sin robar el foco, recordar la
//! posición, ícono en la bandeja del sistema y links `ageoverlay://` desde la web.
//!
//! La lógica (reloj, estrategias, hotkeys, sincronización) vive en el frontend (React).

use std::sync::Mutex;
use std::time::Duration;

use serde::Deserialize;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, WebviewWindow};
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

/// Ubica la ventana arriba a la derecha del monitor principal.
fn place_top_right(window: &WebviewWindow) -> tauri::Result<()> {
    let monitor = match window.primary_monitor()? {
        Some(m) => m,
        None => return Ok(()),
    };
    let scale = monitor.scale_factor();
    let margin = (MARGIN * scale).round() as i32;
    let area = monitor.size();
    let origin = monitor.position();
    let size = window.outer_size()?;
    let x = origin.x + area.width as i32 - size.width as i32 - margin;
    let y = origin.y + margin;
    window.set_position(PhysicalPosition::new(x, y))
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

#[tauri::command]
fn reset_position(window: WebviewWindow) -> Result<(), String> {
    place_top_right(&window).map_err(|e| e.to_string())
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
                    let _ = place_top_right(&w);
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
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(window_state_flags())
                .build(),
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(HitTestState(Mutex::new(HitTest::default())))
        .invoke_handler(tauri::generate_handler![
            set_game_mode,
            set_interactive_rects,
            show_overlay,
            toggle_visibility,
            reset_position,
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
            // Si no hay posición guardada (primera vez), arriba a la derecha.
            let saved = app
                .path()
                .app_config_dir()
                .map(|d| d.join(tauri_plugin_window_state::DEFAULT_FILENAME).exists())
                .unwrap_or(false);
            if !saved {
                if let Some(w) = main_window(app.handle()) {
                    place_top_right(&w)?;
                }
            }
            spawn_hit_test(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar AoE2 Overlay");
}
