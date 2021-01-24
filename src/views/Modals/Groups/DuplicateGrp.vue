<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to duplicate the selected group
            <b style="color: white;">{{ grpData.title }}</b
            >. You can do a simple axial symmetry, or copy and move them
            relative to an axis.
        </p>
        <hr />
        <div class="row">
            <div class="col-5">
                <label style="margin-bottom: 5px;">Type:</label>
                <div class="mb-3">
                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="duplicateType"
                            id="radioSimple"
                            value="0"
                            v-model="dupType"
                        />
                        <label class="form-check-label" for="radioSimple"
                            >Simple</label
                        >
                    </div>
                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="duplicateType"
                            id="radioAxial"
                            value="1"
                            v-model="dupType"
                        />
                        <label class="form-check-label" for="radioAxial"
                            >Axial symmetry</label
                        >
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Axis</label>
                    <select class="form-select" v-model="selectedAxis">
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </div>
            </div>
            <div class="col">
                <div class="mb-3">
                    <label class="form-label">Group title</label>
                    <input
                        type="text"
                        class="form-control"
                        v-model="newGrpTitle"
                    />
                    <div class="form-text">
                        Duplicating will create a new group
                    </div>
                </div>
            </div>
        </div>

        <div class="float-end">
            <button class="btn btn-primary" @click="apply">Apply</button>
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

    private dupType = 0;
    private selectedAxis = "x";
    private newGrpTitle = "";

    mounted() {
        ipcRenderer.on("data", (event, arg) => {
            this.grpData = arg;
            this.newGrpTitle = arg.title + " Duplicate";
        });
    }

    cancel() {
        remote.getCurrentWindow().hide();
    }

    apply() {
        ipcRenderer.send("grpEdit", {
            func: "duplicate",
            data: {
                id: this.grpData.id,
                type: this.dupType,
                axis: this.selectedAxis,
                grpTitle: this.newGrpTitle
            }
        });
        // remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
