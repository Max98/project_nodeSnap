import * as TAURI_W from "@tauri-apps/api/window";

interface WinInfo {
  label: string;
  title: string;
  url: string;
  width: number;
  height: number;
  webview: TAURI_W.WebviewWindow | null;
}

export default class WindowManager {
  private data: WinInfo[] = [
    {
      label: "addGrp",
      title: "Add Grp",
      url: "./addGrp",
      width: 600,
      height: 230,
      webview: null,
    },
  ];

  constructor() {
    this.data.forEach((win) => {
      this.createWindow(win);
    });
  }

  public createWindow(win: WinInfo) {
    TAURI_W.getAll().forEach((window) => {
      if (window.label == win.label) window.close();
    });

    const webview = new TAURI_W.WebviewWindow(win.label, {
      url: win.url,
      title: win.title,
      visible: false,
      width: win.width,
      height: win.height,
    });

    win.webview = webview;
  }

  public showWindow(label: string, data: any = undefined) {
    const win = this.data.find((el) => el.label == label);
    if (!win) {
      console.error(`window titled '${label}' not found`);
      return;
    }

    win.webview!.show().then(() => {
      win.webview!.setFocus();

      if (data) {
        win.webview!.emit("data", JSON.stringify(data));
      }
    });

    TAURI_W.getAll().forEach((window) => {
      console.log(window);
    });
  }

  /**
   *
   */

  public showGrpNodesWindow(slotId: number, nodeId: number) {
    this.showWindow("addGrp", { slotId, nodeId, type: "node" });
  }
}
