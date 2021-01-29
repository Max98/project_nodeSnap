<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to move the whole N/B.
        </p>
        <hr />
        <div class="mb-3">
            <label class="form-label">X offset:</label>
            <input type="number" class="form-control" v-model="x" />
        </div>
        <div class="mb-3">
            <label class="form-label">Y offset:</label>
            <input type="number" class="form-control" v-model="y" />
        </div>
        <div class="mb-3">
            <label class="form-label">Z offset:</label>
            <input type="number" class="form-control" v-model="z" />
        </div>
        <div class="float-end">
            <button class="btn btn-primary" @click="onApply()">
                Apply
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";
import { ipcRenderer } from "electron";

const remote = require("electron").remote;

export default class Translation extends Vue {
    private x = 0;
    private y = 0;
    private z = 0;

    onApply() {
        ipcRenderer.send("transform", {
            func: "translation",
            data: { x: this.x, y: this.y, z: this.z }
        });
        remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
