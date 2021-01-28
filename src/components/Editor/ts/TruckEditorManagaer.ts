import myLogger from "electron-log";

import TruckEditorRenderer from "./TruckEditorRenderer";
import TruckEditor from "./TruckEditor";
import TruckFileImporter from "./Parser/RoR/TruckFileImporter";
import TruckFileExporter from "./Parser/RoR/TruckFileExporter";
import ProjectWatcher from "./Parser/Watcher";

/**
 * All of this runs on the renderer electron process, not the main!
 * Use ipc for communication renderer <=> main
 */

export default class TruckEditorManager {
    private static instance: TruckEditorManager;
    private Log: myLogger.LogFunctions;

    private editorRenderer: TruckEditorRenderer;
    private editorObj: TruckEditor;

    private projectWatcher: ProjectWatcher;

    constructor() {
        TruckEditorManager.instance = this;

        this.Log = myLogger.default.scope("TruckEditorManager");
        this.Log.info("init");

        this.editorRenderer = new TruckEditorRenderer();
        this.editorObj = new TruckEditor();

        this.projectWatcher = new ProjectWatcher();
    }

    /**
     * Returns the instance after it has been created
     */
    public static getInstance(): TruckEditorManager {
        if (!TruckEditorManager.instance) {
            myLogger.warn(
                this.constructor.name + "is still not created, creating one"
            );
            TruckEditorManager.instance = new TruckEditorManager();
        }

        return TruckEditorManager.instance;
    }

    /**
     * Load new file
     * @param path path to file
     * @returns truck title
     */
    public loadFile(path: string) {
        this.editorObj.reset();
        this.editorRenderer.getSceneController().reset();

        this.editorObj.setFilePath(path);
        const truckData = new TruckFileImporter().loadFile(path);

        this.editorObj.loadData(truckData);
        this.editorObj.setSaveState(true);

        return truckData.title;
    }

    /**
     * Save the current open file
     */
    public saveFile() {
        this.projectWatcher.dispose();
        new TruckFileExporter().saveFile(this.editorObj.getFilePath());

        this.getRendererObj()
            .getSceneController()
            .saveConfig(this.editorObj.getFilePath());

        this.projectWatcher.start(this.editorObj.getFilePath());

        this.editorObj.setSaveState(true);
    }

    public requestReload() {
        this.loadFile(this.editorObj.getFilePath());
        this.editorObj.loadTruckData();
    }

    /**
     * Returns the renderer class reference
     */
    public getRendererObj(): TruckEditorRenderer {
        return this.editorRenderer;
    }

    /**
     * Returns the editor class reference
     */
    public getEditorObj(): TruckEditor {
        return this.editorObj;
    }

    /**
     * Triggers after the main page has loaded
     */
    public onLoaded() {
        this.editorObj.loadTruckData();
        this.editorRenderer
            .getSceneController()
            .loadConfig(this.editorObj.getFilePath());
        this.projectWatcher.start(this.editorObj.getFilePath());
    }

    /**
     * Triggers while the main page is being left
     */
    public onLeave() {
        this.editorRenderer
            .getSceneController()
            .saveConfig(this.editorObj.getFilePath());
        this.editorRenderer.dispose();
        this.projectWatcher.dispose();
    }
}
