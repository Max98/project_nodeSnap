<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to scale the whole N/B.
        </p>
        <hr />

        <div class="mb-3">
            <label class="form-label">Factor</label>
            <input type="number" class="form-control" v-model="factor" />
            <div class="form-text">
                Values > 1 makes it bigger and values &lt; 1 makes it smaller
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

export default class Scale extends Vue {
    private factor = 1;

    onApply() {
        ipcRenderer.send("transform", {
            func: "scale",
            data: { factor: this.factor }
        });
        remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
