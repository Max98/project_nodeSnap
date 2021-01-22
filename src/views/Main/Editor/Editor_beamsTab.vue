<template>
    <div class="node-table">
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
                <button
                    class="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#beamsCollapse"
                    aria-expanded="true"
                    aria-controls="beamsCollapse"
                >
                    Beams
                </button>
            </h2>
            <div
                id="beamsCollapse"
                class="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#accordionExample"
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
            <div class="row">
                <div class="col-3">
                    <label>Node1</label>
                </div>
                <div class="col">
                    <input
                        type="text"
                        class="form-control form-control-sm"
                        v-model="selectedBeam.node1"
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
                    />
                </div>
            </div>
            <div class="row">
                <div class="col-3">
                    <label>Type:</label>
                </div>
                <div class="col">
                    <select
                        class="form-select form-select-sm"
                        v-model="selectedBeamType"
                    >
                        <option
                            v-for="(type, idx) in beamTypes"
                            v-bind:key="idx"
                            v-bind:value="type.value"
                            >{{ type.text }}</option
                        >
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="d-grid gap-2 mx-auto">
                        <button
                            type="button"
                            class="btn btn-primary btn-sm me-0"
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
} from "@/components/Editor/ts/TruckFileInterfaces";

import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";
import { TruckFileInterface } from "@/components/Editor/ts/TruckFileInterfaces";

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

    private selectedBeamType = null;
    private beamTypes = [
        { value: null, text: "Beam" },
        { value: "shock", text: "Shock" },
        { value: "hydro", text: "Hydro" },
        { value: "cmd", text: "Command" }
    ];

    @Watch("truckData")
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

        //Select first beam
        if (this.selectedBeam.id == -1) {
            if (this.beamsList[0].beams.length == 0) return;

            let index = 0;

            if (this.beamsList[index].beams.length == 0) {
                index++;
            }

            this.setBeamEditor(
                this.beamsList[index].grp_id,
                this.beamsList[index].beams[0].id
            );
        }
        // we don't need to update the selected beams data as it is no affected by the editor.
    }
    setBeamEditor(grp_id: number, beamId: number) {
        if (grp_id == undefined) return;

        if (this.beamsList) {
            Object.assign(
                this.selectedBeam,
                this.beamsList
                    .filter(el => el.grp_id == grp_id)[0]
                    .beams.filter(el => el.id == beamId)[0]
            );
        }
    }

    getGrpName(grp: number) {
        if (grp == -1) return;

        const title = this.truckDataGroups.filter(el => el.grp_id == grp)[0]
            .title;
        return title;
    }

    addGrp_beam(el: MouseEvent) {
        /**
         * FIX: For some reasons, typescript does not recognize parentNode from mouse Target.
         * we should find a correct solution as I'm just bypassing the "error" here.
         */
        // @ts-ignore
        /*this.addGrpBeamId = parseInt(el.target.parentNode.dataset.beamId);
        console.log(this.addGrpBeamId);

        this.$bvModal.show("modal-addGrpBeam");*/
    }

    deleteBeam(currBeamId: number) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .removeBeam(currBeamId);
    }

    onBeamMouseDown(e: any /** MouseEvent */) {
        let data: any;

        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        this.setBeamEditor(data.grpId, data.beamId);

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
                        this.deleteBeam(data.beamId);
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
                        console.log("delete group");
                    }
                })
            );
            menu.popup({
                window: remote.getCurrentWindow()
            });
        }
    }

    mounted() {
        this.updateBeamsData();
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
        background-color: $info;
        color: white;
    }
}
</style>
