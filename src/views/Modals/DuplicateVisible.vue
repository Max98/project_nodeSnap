<template>
    <div class="container" style="padding-top: 5px;">
        <p>
            You can use this function to duplicate all visible nodes with their
            respective groups.
        </p>
        <hr />
        <div class="row">
            <div class="col-5">
                <div class="mb-3">
                    <label class="form-label">Type</label>
                    <select class="form-select" v-model="dupType">
                        <!--<option value="0">Offset</option> !-->
                        <option value="1">Mirror</option>
                        <!--<option value="2">Mirror (no-flip)</option> !-->
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
                            A suffix for the new groups
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

export default class AddGrp extends Vue {
    private dupType = "1";
    private selectedAxis = "x";
    private newGrpTitle = "-mirror";
    private offset = 1;
    private times = 1;

    cancel() {
        remote.getCurrentWindow().hide();
    }

    apply() {
        ipcRenderer.send("duplicateVisible", {
            func: "duplicateVisible",
            data: {
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
