<template>
    <div class="container" style="padding-top: 5px;">
        <div class="mb-3">
            <label for="grpName" class="form-label">Group title:</label>
            <input type="text" class="form-control" v-model="grpData.title" />
        </div>
        <div class="float-end">
            <button type="button" class="btn btn-secondary" @click="cancel()">
                Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="apply()">
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

interface DataType {
    grpId: number;
    title: string;
}

export default class RenameGrp extends Vue {
    private grpData: DataType = {
        grpId: -1,
        title: ""
    };

    mounted() {
        ipcRenderer.on("data", (event, arg) => {
            this.grpData = arg;
            console.log(arg);
        });
    }

    cancel() {
        remote.getCurrentWindow().hide();
    }

    apply() {
        ipcRenderer.send("grpEdit", {
            func: "rename",
            data: JSON.parse(JSON.stringify(this.grpData))
        });
        remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
