import chokidar from "chokidar";
import { useToast } from "vue-toastification";
import TruckEditorManager from "../TruckEditorManagaer";

export default class ProjectWatcher {
    private watcher: chokidar.FSWatcher | undefined;
    private currWatchingFile = "";

    public start(filePath: string) {
        if (filePath == "") return;

        this.currWatchingFile = filePath;

        this.watcher = chokidar.watch(this.currWatchingFile, {
            persistent: true,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });

        this.watcher.on("change", (event, path) => {
            this.onChange();
        });

        this.watcher.on("error", error =>
            console.log(`Watcher error: ${error}`)
        );

        this.watcher.on("ready", () => {
            console.log("Watching file....");
        });
    }

    public async dispose() {
        if (this.watcher)
            await this.watcher.close().then(() => {
                console.log("Watcher removed");
            });

        console.log("Watcher dispose");
    }

    private onChange() {
        TruckEditorManager.getInstance().loadFile(this.currWatchingFile);
        TruckEditorManager.getInstance()
            .getEditorObj()
            .loadTruckData();
        useToast().info("Project reloaded.");
    }

    public getCurrFile() {
        return this.currWatchingFile;
    }
}
