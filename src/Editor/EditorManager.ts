import { isVisible } from "@testing-library/user-event/dist/utils";
import Editor from "./Editor";
import EditorData, {
  EditorNode,
  EditorBeam,
  EditorGrp,
  EditorSlot,
} from "./EditorDataInterfaces";
import EditorEventListener from "./EditorEventListener";
import EditorImporterMananger, { Importers } from "./EditorImporterManager";
import EditorPlugins from "./EditorPlugins";
import EditorRenderer from "./EditorRenderer";
import TruckFileImporter from "./Ex/TruckFileImporter";
import WindowManager from "./WindowManager";

export default class EditorManager {
  private static instance: EditorManager;

  ImporterManager: EditorImporterMananger;
  Renderer: EditorRenderer;
  Editor: Editor;
  winManager: WindowManager;
  EditorEventListener: EditorEventListener;

  EditorPlugins: EditorPlugins;

  constructor() {
    EditorManager.instance = this;

    this.winManager = new WindowManager();

    this.Renderer = new EditorRenderer(this);
    this.ImporterManager = new EditorImporterMananger();
    this.Editor = new Editor(this.Renderer, this.ImporterManager);

    this.EditorEventListener = new EditorEventListener(this.Editor);

    this.EditorPlugins = new EditorPlugins(
      this.Editor,
      this.Renderer,
      this.ImporterManager
    );
  }

  /**
   * Returns the instance after it has been created
   */
  public static getInstance(): EditorManager {
    if (!EditorManager.instance) {
      console.error(this.constructor.name + "is still not created");
      // EditorManager.instance = new EditorManager();
    }

    return EditorManager.instance;
  }

  public getRenderer() {
    return this.Renderer;
  }

  public getEditorObj() {
    return this.Editor;
  }

  public getWinManager() {
    return this.winManager;
  }

  public getEventListener() {
    return this.EditorEventListener;
  }

  public loadData(path: string) {
    this.Editor.loadData(path, Importers.RoR);
  }

  public requestUIData() {
    this.Editor.sendUpdate();
  }
}
