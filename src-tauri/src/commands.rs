// Default stuff
#[tauri::command]
pub fn add(n1: f64, n2: f64) -> f64 {
  n1 + n2
}

#[tauri::command]
pub fn multiply(n1: f64, n2: f64) -> f64 {
  n1 * n2
}
