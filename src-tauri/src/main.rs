#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod commands;
mod events;

fn main() {
  let app = tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![commands::add, commands::multiply])
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

  app.run(|app_handle, e| events::run_event(app_handle, e));
}
