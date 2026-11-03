// Sin consola extra en release (Windows).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    aoe2_overlay_lib::run()
}
