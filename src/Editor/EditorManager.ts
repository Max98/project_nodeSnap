import { isVisible } from "@testing-library/user-event/dist/utils";
import Editor from "./Editor";
import EditorData, {
  EditorNode,
  EditorBeam,
  EditorGrp,
  EditorSlot,
} from "./EditorDataInterfaces";
import EditorImporterMananger, { Importers } from "./EditorImporterManager";
import EditorRenderer from "./EditorRenderer";
import TruckFileImporter from "./Ex/TruckFileImporter";

export default class EditorManager {
  private static instance: EditorManager;

  ImporterManager: EditorImporterMananger;
  Renderer: EditorRenderer;
  Editor: Editor;

  constructor() {
    EditorManager.instance = this;

    this.Renderer = new EditorRenderer(this);
    this.ImporterManager = new EditorImporterMananger();

    this.Editor = new Editor(this.Renderer, this.ImporterManager);
  }

  /**
   * Returns the instance after it has been created
   */
  public static getInstance(): EditorManager {
    if (!EditorManager.instance) {
      console.warn(
        this.constructor.name + "is still not created, creating one"
      );
      EditorManager.instance = new EditorManager();
    }

    return EditorManager.instance;
  }

  public getRenderer() {
    return this.Renderer;
  }

  public getEditorObj() {
    return this.Editor;
  }

  public loadData(path: string) {
    this.Editor.loadData(path, Importers.RoR);
  }

  public requestUIData() {
    this.Editor.sendUpdate();
  }
}
