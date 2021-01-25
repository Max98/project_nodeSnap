<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to duplicate the selected group
            <b style="color: white;">{{ grpData.title }}</b
            >. You can do a simple offset duplication, a mirror, or a
            non-flipping mirror
        </p>
        <hr />
        <div class="row">
            <div class="col-5">
                <div class="mb-3">
                    <label class="form-label">Type</label>
                    <select class="form-select" v-model="dupType">
                        <option value="0">Offset</option>
                        <option value="1">Mirror</option>
                        <option value="2">Mirror (no-flip)</option>
                    </select>
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
                <div style="min-height: 160px;">
                    <div class="mb-3" v-if="dupType != 0">
                        <label class="form-label">Group title</label>
                        <input
                            type="text"
                            class="form-control"
                            v-model="newGrpTitle"
                        />
                        <div class="form-text">
                            Mirroring will create a new group
                        </div>
                    </div>
                    <div v-if="dupType == 0">
                        <div class="mb-3">
                            <label class="form-label">Offset</label>
                            <input
                                type="number"
                                class="form-control"
                                v-model="offset"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Times</label>
                            <input
                                type="number"
                                class="form-control"
                                v-model="times"
                            />
                        </div>
                    </div>
                </div>

                <div class="float-end">
                    <button class="btn btn-primary" @click="apply">
                        Apply
                    </button>
                </div>
            </div>
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

    private dupType = "0";
    private selectedAxis = "x";
    private newGrpTitle = "";
    private offset = 1;
    private times = 1;

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
                type: parseInt(this.dupType),
                axis: this.selectedAxis,
                grpTitle: this.newGrpTitle,
                offset: this.offset,
                times: this.times
            }
        });
        // remote.getCurrentWindow().hide();
    }
}
</script>

<style></style>
