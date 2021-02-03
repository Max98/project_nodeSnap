<template>
    <div class="node-table">
        <div v-for="(slot, idx) in beamsList" :key="idx">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button beamsCollapse"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#beamsCollapse"
                        aria-expanded="true"
                    >
                        Beams
                    </button>
                </h2>
                <div
                    id="beamsCollapse"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#beamsCollapse"
                >
                    <div v-if="slot.data[0].beams.length == 0 && !slot.data[1]">
                        <div class="row">
                            <div class="col">
                                Empty
                            </div>
                        </div>
                    </div>
                    <div v-for="grp in slot.data" :key="grp.grp_id">
                        <div class="accordion-item">
                            <div
                                class="row grp-row"
                                :data-grp-id="grp.grp_id"
                                @mousedown="onGrpMouseDown"
                            >
                                <template v-if="grp.grp_id != -1">
                                    <div class="col">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button groups-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                :data-bs-target="
                                                    `#group` + grp.grp_id
                                                "
                                                aria-expanded="true"
                                                :aria-controls="
                                                    `group` + grp.grp_id
                                                "
                                            >
                                                <div
                                                    class="acc-title"
                                                    :title="
                                                        getGrpName(grp.grp_id)
                                                    "
                                                >
                                                    grp:
                                                    {{ getGrpName(grp.grp_id) }}
                                                </div>
                                            </button>
                                        </h2>
                                    </div>
                                </template>
                            </div>
                            <div
                                :id="`group` + grp.grp_id"
                                :data-bs-parent="`#group` + grp.grp_id"
                                class="accordion-collapse collapse"
                            >
                                <div
                                    v-for="(beam, idx) in grp.beams"
                                    :key="idx"
                                >
                                    <div
                                        class="row"
                                        @mousedown="onBeamMouseDown"
                                        :data-beam-id="beam.id"
                                        :data-grp-id="beam.grp_id"
                                        :class="{
                                            active: selectedBeam.id == beam.id
                                        }"
                                    >
                                        <div class="col">
                                            {{ beam.node1 }}
                                        </div>
                                        <div class="col">
                                            {{ beam.node2 }}
                                        </div>
                                        <div class="col">
                                            {{ beam.options }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card bg-secondary sidebar-editor">
            <div class="card-body">
                <div style="min-height: 105px;">
                    <div class="row">
                        <div class="col-3">
                            <label>Node1:</label>
                        </div>
                        <div class="col">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                v-model="selectedBeam.node1"
                                :disabled="selectedBeam.node1 == -1"
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">
                            <label>Node2:</label>
                        </div>
                        <div class="col">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                v-model="selectedBeam.node2"
                                :disabled="selectedBeam.node1 == -1"
                            />
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">
                            <label>Option:</label>
                        </div>
                        <div class="col">
                            <input
                                type="text"
                                class="form-control form-control-sm"
                                v-model="selectedBeam.options"
                                :disabled="selectedBeam.node1 == -1"
                            />
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="d-grid gap-2 mx-auto">
                            <button
                                type="button"
                                class="btn btn-primary btn-sm me-0"
                                :disabled="selectedBeam.node1 == -1"
                                @click="applyBeamData()"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch, Prop } from "@/components/vue-decorator";

import {
    EditorBeam,
    EditorTruckData
} from "@/components/Editor/TruckEditorInterfaces";

import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";

import { ipcRenderer } from "electron";
const remote = require("electron").remote;
const { Menu, MenuItem } = remote;

@Options({
    components: {}
})
export default class EditorBeamsTab extends Vue {
    @Prop() readonly truckDataSlots!: EditorTruckData[];

    private beamsList: {
        slot: [
            {
                name: string;
                data: [
                    { grp_id: number; beams: EditorBeam[]; isVisible: boolean }
                ];
            }
        ];
    }[] = [];

    private selectedBeam: EditorBeam = {
        node1: -1,
        node2: -1,
        id: -1,
        isVisible: true,
        grp_id: -1,
        options: ""
    };

    @Watch("truckDataBeams")
    updateBeamsData() {}

    mounted() {
        this.updateBeamsData();
        //this.setBeamEditor(0);
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";
</style>
