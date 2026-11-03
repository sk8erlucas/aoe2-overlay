//! Parte nativa del overlay: ventana transparente encima del juego, modo click-through,
//! mostrar sin robar el foco e ícono en la bandeja del sistema.
//!
//! La lógica (reloj, estrategias, hotkeys) vive en el frontend (React).

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, WebviewWindow};

/// Margen (en píxeles lógicos) respecto del borde de la pantalla.
const MARGIN: f64 = 16.0;

#[cfg(windows)]
mod win {
    use windows_sys::Win32::Foundation::HWND;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetWindowLongPtrW, SetWindowLongPtrW, ShowWindow, GWL_EXSTYLE, SW_SHOWNOACTIVATE,
        WS_EX_NOACTIVATE,
    };

    /// Con WS_EX_NOACTIVATE la ventana nunca toma el foco: el juego sigue recibiendo el teclado.
    pub fn set_no_activate(hwnd: HWND, enabled: bool) {
        unsafe {
            let ex = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            let flag = WS_EX_NOACTIVATE as isize;
            let new = if enabled { ex | flag } else { ex & !flag };
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new);
        }
    }

    /// Muestra la ventana sin activarla (no le saca el foco al juego).
    pub fn show_no_activate(hwnd: HWND) {
        unsafe {
            ShowWindow(hwnd, SW_SHOWNOACTIVATE);
        }
    }
}

fn show_without_focus(window: &WebviewWindow) {
    #[cfg(windows)]
    {
        if let Ok(hwnd) = window.hwnd() {
            win::show_no_activate(hwnd.0 as _);
        } else {
            let _ = window.show();
        }
    }
    #[cfg(not(windows))]
    {
        let _ = window.show();
    }
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

/// Modo juego: los clics atraviesan la ventana y nunca toma el foco.
/// Modo edición: la ventana es interactiva (para elegir estrategia y configurar).
#[tauri::command]
fn set_game_mode(window: WebviewWindow, enabled: bool) -> Result<(), String> {
    window
        .set_ignore_cursor_events(enabled)
        .map_err(|e| e.to_string())?;
    #[cfg(windows)]
    if let Ok(hwnd) = window.hwnd() {
        win::set_no_activate(hwnd.0 as _, enabled);
    }
    if !enabled {
        let _ = window.set_focus();
    }
    Ok(())
}

/// Muestra u oculta el overlay. Devuelve si quedó visible.
#[tauri::command]
fn toggle_visibility(window: WebviewWindow) -> bool {
    toggle_window(&window)
}

/// El frontend la llama cuando terminó de cargar: así no se ve un parpadeo en blanco
/// y la ventana ya existe del todo (mostrarla desde `setup` es demasiado temprano).
#[tauri::command]
fn show_overlay(window: WebviewWindow) {
    show_without_focus(&window);
}

#[tauri::command]
fn reset_position(window: WebviewWindow) -> Result<(), String> {
    place_top_right(&window).map_err(|e| e.to_string())
}

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", "Mostrar / ocultar", true, None::<&str>)?;
    let mode = MenuItem::with_id(app, "mode", "Modo edición / juego", true, None::<&str>)?;
    let corner = MenuItem::with_id(app, "corner", "Volver a la esquina", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Salir", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &mode, &corner, &quit])?;

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
            "quit" => app.exit(0),
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
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = main_window(app) {
                show_without_focus(&w);
            }
        }))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            set_game_mode,
            show_overlay,
            toggle_visibility,
            reset_position
        ])
        .setup(|app| {
            build_tray(app.handle())?;
            if let Some(w) = main_window(app.handle()) {
                place_top_right(&w)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar AoE2 Overlay");
}
