<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to rotate the whole N/B.
        </p>
        <hr />
        <div class="row">
            <div class="col">
                <div class="mb-3">
                    <label class="form-label">Axis</label>
                    <select class="form-select" v-model="axis">
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </div>
            </div>
            <div class="col">
                <div class="mb-3">
                    <label class="form-label">Angle</label>
                    <input type="number" class="form-control" v-model="angle" />
                    <div class="form-text">
                        in degrees (°)
                    </div>
                </div>
            </div>
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

export default class Rotation extends Vue {
    private axis = "x";
    private angle = 0;

    onApply() {
        ipcRenderer.send("transform", {
            func: "rotation",
            data: { axis: this.axis, angle: this.angle }
        });
        remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
