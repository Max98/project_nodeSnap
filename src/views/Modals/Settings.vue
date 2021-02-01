<template>
    <div class="container" style="padding-top: 5px;">
        <label class="form-label">Grid size: {{ gridSize }}</label>
        <div class="input-group mb-3">
            <input
                type="range"
                class="form-range"
                min="0.1"
                v-model="gridSize"
                max="4"
                step="0.1"
            />
        </div>
        <hr />
        <label class="form-label">Node size: {{ nodeSize }}</label>
        <div class="input-group mb-3">
            <input
                type="range"
                class="form-range"
                min="0.1"
                v-model="nodeSize"
                max="5"
                step="0.1"
            />
        </div>
        <div class="input-group mb-3">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="nodesName"
                />
                <label class="form-check-label">Display nodes name</label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "../../components/vue-decorator";
import { ipcRenderer } from "electron";

export default class Settings extends Vue {
    private nodeSize = "1";
    private gridSize = "1";
    private nodesName = false;

    @Watch("nodesName")
    @Watch("nodeSize")
    @Watch("gridSize")
    updateSettings() {
        ipcRenderer.send("set-settings", {
            nodesSpriteScale: parseFloat(this.nodeSize),
            gridSize: parseFloat(this.gridSize),
            displayNodesName: this.nodesName
        });
    }
}
</script>

<style></style>
