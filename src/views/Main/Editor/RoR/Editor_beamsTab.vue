<template>
    <div class="node-table">
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button
                    class="accordion-button"
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
                <div v-if="beamsList[0].beams.length == 0 && !beamsList[1]">
                    <div class="row">
                        <div class="col">
                            Empty
                        </div>
                    </div>
                </div>
                <div v-for="grp in beamsList" :key="grp.grp_id">
                    <div
                        class="row grp-row"
                        :data-grp-id="grp.grp_id"
                        @mousedown="onGrpMouseDown"
                    >
                        <template v-if="grp.grp_id != -1">
                            <div class="col">
                                grp: {{ getGrpName(grp.grp_id) }}
                            </div>
                        </template>
                    </div>
                    <div v-for="(beam, idx) in grp.beams" :key="idx">
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
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch, Prop } from "@/components/vue-decorator";

import {
    EditorBeam,
    EditorGroup
} from "@/components/Editor/ts/RoR/TruckFileInterfaces";

import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";
import { TruckFileInterface } from "@/components/Editor/ts/RoR/TruckFileInterfaces";

import { ipcRenderer } from "electron";
const remote = require("electron").remote;
const { Menu, MenuItem } = remote;

@Options({
    components: {}
})
export default class EditorBeamsTab extends Vue {
    @Prop() readonly truckDataBeams!: EditorBeam[];
    @Prop() readonly truckDataGroups!: EditorGroup[];

    private beamsList: {
        grp_id: number;
        beams: EditorBeam[];
        is_visible: boolean;
    }[] = [
        {
            grp_id: -1,
            is_visible: true,
            beams: []
        }
    ];

    private selectedBeam: EditorBeam = {
        node1: -1,
        node2: -1,
        id: -1,
        isVisible: true,
        grp_id: -1,
        comment_id: -1,
        sbd_preset_id: -1,
        snd_preset_id: -1
    };

    @Watch("truckDataBeams")
    updateBeamsData() {
        let lastGrp = -1;

        this.beamsList = [];

        this.beamsList.push({
            grp_id: -1,
            is_visible: true,
            beams: []
        });

        if (Array.isArray(this.truckDataBeams)) {
            this.truckDataBeams.forEach(beam => {
                if (beam.grp_id != lastGrp) {
                    this.beamsList.push({
                        grp_id: beam.grp_id,
                        is_visible: true,
                        beams: []
                    });
                    lastGrp = beam.grp_id;
                }
            });

            this.truckDataBeams.forEach(beam => {
                if (this.beamsList.some(el => el.grp_id == beam.grp_id)) {
                    const newBeam: EditorBeam = beam as EditorBeam;
                    newBeam.isVisible = true;

                    this.beamsList
                        .filter(el => el.grp_id == beam.grp_id)[0]
                        .beams.push(newBeam);
                }
            });
        }
    }

    @Watch("truckDataBeams")
    onUpdate() {
        this.setBeamEditor(this.selectedBeam.id);
    }

    setBeamEditor(beamId: number) {
        const currBeam = this.truckDataBeams.find(el => el.id == beamId);
        if (currBeam != undefined) {
            this.selectedBeam = currBeam;
        }
    }

    getGrpName(grp: number) {
        if (grp == -1) return;

        const title = this.truckDataGroups.filter(el => el.grp_id == grp)[0]
            .title;
        return title;
    }

    onBeamMouseDown(e: any /** MouseEvent */) {
        let data: any;

        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        this.setBeamEditor(data.beamId);

        const menu = new Menu();
        if (e.button == 2) {
            menu.append(
                new MenuItem({
                    label: "Add new group before beam",
                    click: () => {
                        ipcRenderer.send("setModalVisibility", {
                            name: "addGrp",
                            state: true,
                            data: {
                                id: data.beamId,
                                title: "newGrp",
                                type: "beam"
                            }
                        });
                    }
                })
            );
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(
                new MenuItem({
                    label: "Delete beam",
                    click: () => {
                        TruckEditorManager.getInstance()
                            .getEditorObj()
                            .removeBeam(data.beamId);
                    }
                })
            );
            menu.popup({ window: remote.getCurrentWindow() });
        }
    }

    onGrpMouseDown(e: any) {
        let data: any;

        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        const menu = new Menu();
        if (e.button == 2) {
            menu.append(
                new MenuItem({
                    label: "Rename group",
                    click: () => {
                        ipcRenderer.send("setModalVisibility", {
                            name: "renameGrp",
                            state: true,
                            data: {
                                id: data.grpId,
                                title: this.getGrpName(data.grpId)
                            }
                        });
                    }
                })
            );
            menu.append(
                new MenuItem({
                    label: "Delete group",
                    click: () => {
                        TruckEditorManager.getInstance()
                            .getEditorObj()
                            .removeGrp(data.grpId);
                    }
                })
            );
            menu.popup({
                window: remote.getCurrentWindow()
            });
        }
    }

    applyBeamData() {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .setBeamData(this.selectedBeam);
    }

    mounted() {
        this.updateBeamsData();
        this.setBeamEditor(0);
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";

.node-table {
    .accordion-button {
        padding: 0 1rem;
        background-color: $darker;
    }
    .accordion-button:not(.collapsed) {
        background-color: #7e543e;
        color: white;
    }
}
</style>
