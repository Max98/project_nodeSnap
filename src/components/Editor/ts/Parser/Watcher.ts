import { useToast } from "vue-toastification";
import TruckEditorManager from "../TruckEditorManagaer";
import { FSWatcher } from "fs";
import watch from "node-watch";

export default class ProjectWatcher {
    private watcher: FSWatcher | undefined;
    private currWatchingFile = "";

    public start(filePath: string) {
        if (filePath == "") return;

        this.currWatchingFile = filePath;

        this.watcher = watch(this.currWatchingFile, { recursive: false });

        this.watcher.on("ready", () => {
            console.log("Watching file... " + this.currWatchingFile);
        });

        this.watcher.on("change", (evt, name) => {
            if (evt == "update") {
                this.onChange();
            }
        });
    }

    public async dispose() {
        if (this.watcher) this.watcher.close();

        console.log("Watcher dispose");
    }

    private onChange() {
        const tM = TruckEditorManager.getInstance();

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
