#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// Default stuff
#[tauri::command]
fn add(n1: f64, n2: f64) -> f64 {
  return n1 + n2;
}

#[tauri::command]
fn multiply(n1: f64, n2: f64) -> f64 {
  return n1 * n2;
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![add, multiply])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
