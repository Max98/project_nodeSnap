<template>
    <div class="container" style="padding-top: 5px;">
        <div class="mb-3">
            <label for="grpName" class="form-label">Group title:</label>
            <input type="text" class="form-control" v-model="grpData.title" />
        </div>
        <hr />
        <p style="min-height: 40px; max-height: 40px;">
            You will be adding a new group named
            <b style="color:white;">{{ grpData.title }}</b> before
            <b style="color:white;">{{ grpData.type + ` ` + grpData.id }}</b>
            and will affect it to all the {{ grpData.type + `s` }} after it.
        </p>
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
    type: string;
    id: number;
    title: string;
}

export default class AddGrp extends Vue {
    private grpData: DataType = {
        type: "node", //"beam"
        id: -1,
        title: ""
    };

    mounted() {
        ipcRenderer.on("data", (event, arg) => {
            this.grpData = arg;
        });
    }

    cancel() {
        remote.getCurrentWindow().hide();
    }

    apply() {
        ipcRenderer.send("grpEdit", {
            func: "add",
            data: JSON.parse(JSON.stringify(this.grpData))
        });
        remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
