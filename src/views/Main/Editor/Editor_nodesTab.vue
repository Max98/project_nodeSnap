<template>
    <div class="node-table">
        <div v-for="(slot, idx) in truckDataSlots" :key="idx">
            <div class="accordion-item">
                <div class="row">
                    <div class="col" style="flex: 0 0 26px !important;">
                        <input
                            v-model="slot.slot.isVisible"
                            class="form-check-input"
                            type="checkbox"
                        />
                    </div>
                    <div class="col">
                        <h2 class="accordion-header">
                            <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                :data-bs-target="`#Slot` + idx"
                                aria-expanded="false"
                                :aria-controls="`Slot` + idx"
                            >
                                slot: {{ slot.slot.name }}
                            </button>
                        </h2>
                    </div>
                </div>

                <div
                    :id="`Slot` + idx"
                    :data-bs-parent="`#Slot` + idx"
                    class="accordion-collapse collapse"
                >
                    <div v-if="slot.nodes.length == 0 && !slot.nodes[1]">
                        <div class="row">
                            <div class="col">
                                Empty
                            </div>
                        </div>
                    </div>
                    <div v-for="(node, idx) in slot.nodes" :key="idx">
                        <div
                            class="row"
                            @mousedown="onNodeMouseDown"
                            :data-grp-id="node.grp_id"
                            :data-node-id="node.id"
                            :class="{
                                active: selectedNode.id == node.id
                            }"
                        >
                            <div class="col" style="flex: 0 0 26px !important;">
                                <input
                                    v-model="node.isVisible"
                                    class="form-check-input"
                                    type="checkbox"
                                    @change="
                                        onChangeNodeVisibility(
                                            node.id,
                                            $event.srcElement.checked
                                        )
                                    "
                                />
                            </div>
                            <div class="col" style="flex: 0 0 60px !important;">
                                {{ node.name }}
                            </div>
                            <div class="col">
                                {{ Math.trunc(node.x * 100) / 100 }}
                            </div>
                            <div class="col">
                                {{ Math.trunc(node.y * 100) / 100 }}
                            </div>
                            <div class="col">
                                {{ Math.trunc(node.z * 100) / 100 }}
                            </div>
                        </div>
                    </div>
                    <div v-for="grp in slot.groups" :key="grp.grp_id">
                        <div class="accordion-item">
                            <div
                                class="row grp-row"
                                :data-grp-id="grp.grp_id"
                                @mousedown="onGrpMouseDown"
                            >
                                <template v-if="grp.grp_id != -1">
                                    <div
                                        class="col"
                                        style="flex: 0 0 26px !important;"
                                    >
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            v-model="grp.isVisible"
                                            @change="
                                                onChangeGroupVisibility(
                                                    grp.grp_id,
                                                    $event.srcElement.checked
                                                )
                                            "
                                        />
                                    </div>
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
                            ></div>
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
                        <label>x:</label>
                    </div>
                    <div class="col">
                        <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="selectedNode.x"
                            :disabled="selectedNode.id == -1"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col-3">
                        <label>y:</label>
                    </div>
                    <div class="col">
                        <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="selectedNode.y"
                            :disabled="selectedNode.id == -1"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col-3">
                        <label>z:</label>
                    </div>
                    <div class="col">
                        <input
                            type="text"
                            class="form-control form-control-sm"
                            v-model="selectedNode.z"
                            :disabled="selectedNode.id == -1"
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
                            v-model="selectedNode.options"
                            :disabled="selectedNode.id == -1"
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
                            :disabled="selectedNode.id == -1"
                            @click="applySeletedNode()"
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
    EditorNode,
    EditorGroup,
    EditorTruckData
} from "@/components/Editor/TruckEditorInterfaces";

import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";

import { ipcRenderer } from "electron";
import { watch } from "fs";
const remote = require("electron").remote;
const { Menu, MenuItem } = remote;

@Options({
    name: "EditorNodesTab",
    components: {}
})
export default class EditorNodesTab extends Vue {
    @Prop() readonly truckDataSlots!: EditorTruckData[];

    private truckfileName = "hai";

    private selectedNode: EditorNode = {
        id: -1,
        x: 0,
        y: 0,
        z: 0,
        options: "",
        name: "-1",

        grp_id: -1,

        isVisible: true
    };

    @Watch("truckDataSlots")
    updateNodesData() {
        console.log(this.truckDataSlots);
    }

    mounted() {
        this.updateNodesData();
        //this.setNodeEditor(0);
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";
</style>
