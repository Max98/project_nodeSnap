use tauri::Manager;
use tauri::Window;

pub fn run_event(app_handle: &tauri::AppHandle, event: tauri::Event) {
  match event {
    tauri::Event::CloseRequested { label, api, .. } => {
      let app_handle = app_handle.clone();
      let window = app_handle.get_window(&label).unwrap();

      println!("{}", &label);
      if &label != "main" {
        api.prevent_close();
        window.hide().expect("failed to close");
      } else {
        // since it's the main window that's closing
        // we need to 'force' close all the hidden windows too
        // or the app will never quit by its own
        for (_hash, win) in app_handle.windows() {
          win.close().expect("failed to close");
        }
      }
    }
    _ => {}
  }
}
