<template>
    <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";
import { Watch } from "@/components/vue-decorator";
import { ipcRenderer } from "electron";

const remote = require("electron").remote;
const { dialog } = remote;

export default class Main extends Vue {
    get settings() {
        return this.$store.getters.getSettings;
    }

    @Watch("settings")
    private updateSettings() {
        const tM: TruckEditorManager = TruckEditorManager.getInstance();
        //nodes scale
        tM.getRendererObj()
            .getSceneManager()
            .getCurrSceneController()
            .scaleNodeSprites(this.settings.nodesSpriteScale);

        //nodes names
        tM.getRendererObj()
            .getSceneManager()
            .getCurrSceneController()
            .setNodesNameVisibility(this.settings.displayNodesName);

        //grid factor
        tM.getRendererObj().setGridFactor(this.settings.gridSize);
    }

    created() {
        ipcRenderer.on("set-settings", (event, arg) => {
            this.$store.dispatch("setSettings", arg);
        });

        ipcRenderer.on("grpEdit", (event, arg) => {
            const tM: TruckEditorManager = TruckEditorManager.getInstance();

            switch (arg.func) {
                case "rename":
                    tM.getEditorObj()!.renameGrp(arg.data.id, arg.data.title); //TODO: investigate why JSON changes grpId to id.
                    break;

                case "add":
                    tM.getEditorObj()!.addGrp(
                        arg.data.id,
                        arg.data.title,
                        arg.data.type
                    );
                    break;

                case "duplicate":
                    tM.getEditorObj()!.duplicateGrp(
                        arg.data.id,
                        arg.data.type,
                        arg.data.axis,
                        arg.data.grpTitle,
                        parseInt(arg.data.offset),
                        parseInt(arg.data.times)
                    );
                    break;

                default:
                    break;
            }
        });

        ipcRenderer.on("blueprintEdit", (event, arg) => {
            const tM: TruckEditorManager = TruckEditorManager.getInstance();

            switch (arg.func) {
                case "add":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBlueprintSystem()
                        .load(arg.data.filePath, parseFloat(arg.data.opacity));
                    break;

                case "remove":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBlueprintSystem()
                        .remove();
                    break;

                case "toggle":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBlueprintSystem()
                        .toggleVisibility();

                    break;

                case "set-opacity":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBlueprintSystem()
                        .setOpacity(parseFloat(arg.data.opacity));
                    break;

                default:
                    break;
            }
        });

        ipcRenderer.on("modelEdit", (event, arg) => {
            const tM: TruckEditorManager = TruckEditorManager.getInstance();

            switch (arg.func) {
                case "add":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBluemodelSystem()
                        .load(arg.data.filePath, parseFloat(arg.data.opacity));
                    break;

                case "remove":
                    tM.getRendererObj()
                        .getSceneManager()
                        .getBluemodelSystem()
                        .remove();
                    break;

                case "toggle":
                    tM.getRendererObj()
                        .getSceneManager()

                        .getBluemodelSystem()
                        .toggleVisibility();
                    break;

                case "set-opacity":
                    tM.getRendererObj()
                        .getSceneManager()
                        .getBluemodelSystem()
                        .setOpacity(parseFloat(arg.data.opacity));
                    break;

                default:
                    break;
            }
        });

        ipcRenderer.on("transform", (event, arg) => {
            const tM: TruckEditorManager = TruckEditorManager.getInstance();

            switch (arg.func) {
                case "rotation":
                    tM.getEditorObj()!.rotateAll(
                        parseFloat(arg.data.angle),
                        arg.data.axis
                    );
                    break;

                case "scale":
                    tM.getEditorObj()!.scaleAll(parseFloat(arg.data.factor));
                    break;

                case "translation":
                    tM.getEditorObj()!.translateAll({
                        x: parseFloat(arg.data.x),
                        y: parseFloat(arg.data.y),
                        z: parseFloat(arg.data.z)
                    });
                    break;

                default:
                    break;
            }
        });

        ipcRenderer.on("duplicateVisible", (event, arg) => {
            const tM: TruckEditorManager = TruckEditorManager.getInstance();

            tM.getEditorObj()!.duplicateVisible(
                arg.data.type,
                arg.data.axis,
                arg.data.grpTitle,
                parseInt(arg.data.offset),
                parseInt(arg.data.times)
            );
        });

        window.onbeforeunload = (e: Event) => {
            if (
                !process.env.WEBPACK_DEV_SERVER_URL &&
                !TruckEditorManager.getInstance()
                    .getStoreObj()
                    .getSaveState()
            ) {
                const bl = dialog.showMessageBoxSync({
                    title: "Confirmation",
                    type: "warning",
                    buttons: ["Yes", "Cancel"],
                    defaultId: 1,
                    cancelId: 1,
                    message:
                        "You have an open project, did you save it? You will lose all your work if you continue. \nAre you sure?"
                });

                if (bl == 1) {
                    e.returnValue = false;
                }
            }
        };
    }
}
</script>

<style lang="scss"></style>
