<template>
    <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";
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
            .getSceneController()
            .scaleNodeSprites(this.settings.nodesSpriteScale);

        //nodes names
        tM.getRendererObj()
            .getSceneController()
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
                    tM.getEditorObj().renameGrp(arg.data.id, arg.data.title); //TODO: investigate why JSON changes grpId to id.
                    break;

                case "add":
                    tM.getEditorObj().addGrp(
                        arg.data.id,
                        arg.data.title,
                        arg.data.type
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
                        .getSceneController()
                        .getBlueprintSystem()
                        .load(arg.data.filePath, arg.data.opacity);
                    break;

                case "remove":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBlueprintSystem()
                        .remove();
                    break;

                case "toggle":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBlueprintSystem()
                        .toggleVisibility();

                    break;

                case "set-opacity":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBlueprintSystem()
                        .setOpacity(arg.data.opacity);
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
                        .getSceneController()
                        .getBluemodelSystem()
                        .load(arg.data.filePath, arg.data.opacity);
                    break;

                case "remove":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBluemodelSystem()
                        .remove();
                    break;

                case "toggle":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBluemodelSystem()
                        .toggleVisibility();
                    break;

                case "set-opacity":
                    tM.getRendererObj()
                        .getSceneController()
                        .getBluemodelSystem()
                        .setOpacity(arg.data.opacity);
                    break;

                default:
                    break;
            }
        });

        /*window.onbeforeunload = (e: Event) => {
            if (!this.settings.isSaved) {
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
        };*/
    }
}
</script>

<style lang="scss"></style>
