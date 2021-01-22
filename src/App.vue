<template>
    <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "./components/Editor/ts/TruckEditorManagaer";
import { Watch } from "./components/vue-decorator";
import { ipcRenderer } from "electron";

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
                    ); //TODO: investigate why JSON changes grpId to id.
                    break;

                default:
                    break;
            }
        });
    }
}
</script>

<style lang="scss"></style>
