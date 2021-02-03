import myLogger from "electron-log";

import TruckEditorRenderer from "./TruckEditorRenderer";
import TruckEditor from "./RoR/RoRTruckEditor";
import TruckFileImporter from "./RoR/Parser/TruckFileImporter";
import TruckFileExporter from "./RoR/Parser/TruckFileExporter";
import ProjectWatcher from "./Watcher";

import JBeamImporter from "./BeamNG/Parser/JBeamImporter";
import TruckFileData from "./RoR/Parser/TruckFileData";
import Editor from "./Common/EditorClass";
import { editorType } from "./TruckEditorInterfaces";
import StoreClass from "./Common/StoreClass";
import JBeamEditor from "./BeamNG/JBeamEditor";
import JBeamStore from "./BeamNG/Parser/JBeamStore";

/**
 * All of this runs on the renderer electron process, not the main!
 * Use ipc for communication renderer <=> main
 */

export default class TruckEditorManager {
    private static instance: TruckEditorManager;
    private Log: myLogger.LogFunctions;

    private editorRenderer: TruckEditorRenderer;
    private editorObj: Editor | undefined;
    private editorStore: StoreClass;

    private projectWatcher: ProjectWatcher;

    private editorType: editorType = editorType.BEAMNG;

    constructor() {
        TruckEditorManager.instance = this;

        this.Log = myLogger.default.scope("TruckEditorManager");
        this.Log.info("init");

        this.editorRenderer = new TruckEditorRenderer();
        this.editorStore = new JBeamStore();

        this.projectWatcher = new ProjectWatcher();

        //new JBeamImporter();
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
        /*if (this.editorObj) this.editorObj.reset();
        this.editorRenderer.getSceneManager().reset();

        this.editorStore.setFilePath(path);
        const truckData = new TruckFileImporter().loadFile(path);

        if (!truckData) return;

        (this.editorStore as TruckFileData).loadData(truckData);
        this.editorStore.setSaveState(true);
        this.editorObj = new TruckEditor();

        this.editorObj.fetchData();

        return truckData.title;*/

        const jBeam = new JBeamImporter().loadFile("");

        (this.editorStore as JBeamStore).loadData(jBeam);
        this.editorStore.setSaveState(true);

        return "";
    }

    /**
     * Save the current open file
     */
    public saveFile() {
        this.projectWatcher.dispose();
        new TruckFileExporter().saveFile(this.editorStore.getFilePath());

        this.getRendererObj()
            .getSceneManager()
            .saveConfig(this.editorStore.getFilePath());

        this.projectWatcher.start(this.editorStore.getFilePath());

        this.editorStore.setSaveState(true);
    }

    public requestReload() {
        if (this.editorObj) {
            this.loadFile(this.editorStore.getFilePath());
            this.editorObj.loadTruckData();
        } else {
            throw console.error("editorObj not found!");
        }
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
    public getEditorObj(): Editor | undefined {
        return this.editorObj;
    }

    public getStoreObj(): StoreClass {
        return this.editorStore;
    }

    /**
     * Triggers after the editor page has loaded
     * Warning: we are talking about Editor_main.vue here, not Editor.vue
     */
    public onLoaded() {
        this.loadFile("");
        this.editorObj = new JBeamEditor();
        this.editorObj.fetchData();
        this.editorObj.loadTruckData();
        this.editorRenderer
            .getSceneManager()
            .loadConfig(this.editorStore.getFilePath());
        this.projectWatcher.start(this.editorStore.getFilePath());
    }

    /**
     * Triggers while the main page is being left
     */
    public onLeave() {
        this.editorRenderer
            .getSceneManager()
            .saveConfig(this.editorStore.getFilePath());
        this.editorRenderer.dispose();
        this.projectWatcher.dispose();
    }
}
