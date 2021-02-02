import { useToast } from "vue-toastification";
import TruckEditorManager from "./TruckEditorManagaer";
import { FSWatcher } from "fs";
import watch from "node-watch";
import * as Logger from "electron-log";

export default class ProjectWatcher {
    private watcher: FSWatcher | undefined;
    private currWatchingFile = "";
    private logger: Logger.LogFunctions;

    constructor() {
        this.logger = Logger.default.scope("ProjectWatcher");
        this.logger.info("init");
    }

    public start(filePath: string) {
        if (filePath == "") return;

        this.currWatchingFile = filePath;

        this.watcher = watch(this.currWatchingFile, { recursive: false });

        this.watcher.on("ready", () => {
            this.logger.log("Watching file... " + this.currWatchingFile);
        });

        this.watcher.on("change", (evt, name) => {
            if (evt == "update") {
                this.onChange();
            }
        });
    }

    public async dispose() {
        if (this.watcher) this.watcher.close();

        this.logger.log("Watcher dispose");
    }

    private onChange() {
        const tM = TruckEditorManager.getInstance();
        this.logger.log("change detected");

        if (tM.getEditorObj().getSaveState() == true) {
            tM.loadFile(this.currWatchingFile);
            tM.getEditorObj().loadTruckData();
            useToast().info("Project reloaded.");
        } else {
            useToast().warning(
                "Failed to reload project, please save your progress!"
            );
        }
    }

    public getCurrFile() {
        return this.currWatchingFile;
    }
}
