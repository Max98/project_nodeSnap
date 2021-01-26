<template>
    <div class="node-table">
        <div v-if="nodesList[0].nodes.length == 0 && !nodesList[1]">
            <div class="row">
                <div class="col">
                    Empty
                </div>
            </div>
        </div>
        <div v-for="grp in nodesList" :key="grp.grp_id">
            <div
                class="row grp-row"
                :data-grp-id="grp.grp_id"
                @mousedown="onGrpMouseDown"
            >
                <template v-if="grp.grp_id != -1">
                    <div class="col" style="flex: 0 0 26px !important;">
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
                    <div class="col">grp: {{ getGrpName(grp.grp_id) }}</div>
                </template>
            </div>
            <div v-for="(node, idx) in grp.nodes" :key="idx">
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
                    <div class="col">
                        {{ node.id }}
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
    nodeType,
    EditorGroup
} from "@/components/Editor/ts/TruckFileInterfaces";

import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";
import { TruckFileInterface } from "@/components/Editor/ts/TruckFileInterfaces";

import { ipcRenderer } from "electron";
import { watch } from "fs";
const remote = require("electron").remote;
const { Menu, MenuItem } = remote;

@Options({
    name: "EditorNodesTab",
    components: {}
})
export default class EditorNodesTab extends Vue {
    @Prop() readonly truckDataNodes!: EditorNode[];
    @Prop() readonly truckDataGroups!: EditorGroup[];

    private nodesList: {
        grp_id: number;
        nodes: EditorNode[];
        isVisible: boolean;
    }[] = [
        {
            grp_id: -1,
            isVisible: true,
            nodes: []
        }
    ];

    private selectedNode: EditorNode = {
        id: -1,
        x: 0,
        y: 0,
        z: 0,
        options: "",
        name: "-1",
        type: nodeType.DEFAULT,

        grp_id: -1,
        comment_id: -1,
        sbd_preset_id: -1,
        snd_preset_id: -1,
        isVisible: true
    };

    @Watch("truckDataNodes")
    updateNodesData() {
        let lastGrp = -1;

        this.nodesList = [];
        this.nodesList.push({
            grp_id: -1,
            isVisible: true,
            nodes: []
        });

        if (Array.isArray(this.truckDataNodes)) {
            this.truckDataNodes.forEach(node => {
                if (node.grp_id != lastGrp) {
                    if (this.truckDataGroups == undefined) return; //shouldn't happen

                    this.nodesList.push({
                        grp_id: node.grp_id,
                        isVisible: this.truckDataGroups.find(
                            el => el.grp_id == node.grp_id
                        )!.isVisible,
                        nodes: []
                    });
                    lastGrp = node.grp_id;
                }
            });

            this.truckDataNodes.forEach(node => {
                if (this.nodesList.some(el => el.grp_id == node.grp_id)) {
                    const newNode = node;

                    this.nodesList
                        .filter(el => el.grp_id == node.grp_id)[0]
                        .nodes.push(newNode);
                }
            });
        }
    }

    getGrpName(grp: number) {
        if (grp == -1) return;

        const title = this.truckDataGroups?.filter(el => el.grp_id == grp)[0]
            .title;
        return title;
    }

    @Watch("truckDataNodes")
    onUpdate() {
        this.setNodeEditor(this.selectedNode.id);
    }

    setNodeEditor(nodeId: number) {
        const currNode = this.truckDataNodes.find(el => el.id == nodeId);
        if (currNode != undefined) {
            this.selectedNode = { ...currNode };
        }
    }

    deleteNode(currNodeId: number) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .removeNode(currNodeId);
    }

    onNodeMouseDown(e: any /** MouseEvent */) {
        let data: any;

        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        this.setNodeEditor(data.nodeId);

        if (e.button == 2) {
            const menu = new Menu();
            menu.append(
                new MenuItem({
                    label: "Add new group before node",
                    click: () => {
                        ipcRenderer.send("setModalVisibility", {
                            name: "addGrp",
                            state: true,
                            data: {
                                id: data.nodeId,
                                title: "newGrp",
                                type: "node"
                            }
                        });
                    }
                })
            );
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(
                new MenuItem({
                    label: "Delete node",
                    click: () => {
                        this.deleteNode(data.nodeId);
                    }
                })
            );
            menu.popup({
                window: remote.getCurrentWindow()
            });
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
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(
                new MenuItem({
                    label: "Duplicate",
                    click: () => {
                        ipcRenderer.send("setModalVisibility", {
                            name: "duplicateGrp",
                            state: true,
                            data: {
                                id: data.grpId,
                                title: this.getGrpName(data.grpId)
                            }
                        });
                    }
                })
            );
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(
                new MenuItem({
                    label: "Show only this",
                    click: () => {
                        const currGrp = data.grpId;
                        this.truckDataGroups!.forEach(el => {
                            if (el.grp_id == currGrp) {
                                this.onChangeGroupVisibility(currGrp, true);
                                return;
                            }

                            this.onChangeGroupVisibility(el.grp_id, false);
                        });
                    }
                })
            );
            menu.append(
                new MenuItem({
                    label: "Show all",
                    click: () => {
                        this.truckDataGroups!.forEach(el => {
                            this.onChangeGroupVisibility(el.grp_id, true);
                        });
                    }
                })
            );
            menu.popup({
                window: remote.getCurrentWindow()
            });
        }
    }

    onChangeNodeVisibility(id: number, state: boolean) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .setNodeVisibility(id, state);
    }

    onChangeGroupVisibility(id: number, state: boolean) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .setGroupVisibility(id, state);

        /**
         * Update UI
         */
        this.nodesList.forEach(el => {
            if (el.grp_id == id) {
                el.isVisible = state;
                el.nodes.forEach(el => (el.isVisible = state));
            }
        });
    }

    applySeletedNode() {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .setNodeData(this.selectedNode);
    }

    mounted() {
        this.updateNodesData();
        this.setNodeEditor(0);
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";
</style>
