import { Event, listen } from "@tauri-apps/api/event";
import Editor from "./Editor";

interface PayloadData {
  action: string;
  payload: {
    [key: string]: any;
  };
}

export default class EditorEventListener {
  private editorObj: Editor;

  constructor(_Editor: Editor) {
    this.editorObj = _Editor;

    this.registerListener("backData", this.onBackDataListen);
  }

  private registerListener(label: string, callback: Function) {
    listen(label, (e) => {
      const data: PayloadData = JSON.parse(e.payload as string);

      callback(data);
    });
  }

  private onBackDataListen(data: PayloadData) {
    console.log(data);

    switch (data.action) {
      case "addGrp": {
        this.editorObj.addGrpNodes(
          data.payload.slotId,
          data.payload.nodeId,
          data.payload.grpTitle
        );

        break;
      }

      default:
        break;
    }
  }
}
