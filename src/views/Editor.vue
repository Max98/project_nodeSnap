<template>
    <div>
        <b-row class="body_row">
            <b-col class="side_bar_col">
                <b-card variant="dark" no-body class="sidebar_menu_card">
                    <div class="sidebar_header">
                        <p
                            class="font-weight-light"
                            style="padding: 5px 20px; font-size: 20px; color: white; text-align: center;"
                        >
                            rorEditor
                        </p>
                    </div>

                    <b-tabs @mousedown="emitObj">
                        <b-tab title="Nodes" active>
                            <div v-if="doneLoading" class="node-table">
                                <div v-for="grp in nodesList" :key="grp.grp_id">
                                    <b-row
                                        @mousedown="onGrpMouseDown"
                                        :id="`grp-` + grp.grp_id"
                                    >
                                        {{ getGrpName(grp.grp_id) }}
                                    </b-row>
                                    <div
                                        v-for="(node, idx) in grp.nodes"
                                        :key="idx"
                                    >
                                        <b-row
                                            @mousedown="onNodeMouseDown"
                                            :data-grp-id="node.grp_id"
                                            :data-node-id="node.idEditor"
                                            :class="{
                                                active:
                                                    selectedNode.id == node.id
                                            }"
                                        >
                                            <b-col
                                                style="flex: 0 0 26px !important;"
                                            >
                                                <b-form-checkbox
                                                    v-model="node.is_visible"
                                                    :id="
                                                        `checkbox-` +
                                                            node.idEditor
                                                    "
                                                    @change="
                                                        onCheckNode(
                                                            node.idEditor
                                                        )
                                                    "
                                                ></b-form-checkbox>
                                            </b-col>
                                            <b-col>{{ node.id }}</b-col>
                                            <b-col>
                                                {{
                                                    Math.trunc(node.x * 100) /
                                                        100
                                                }}
                                            </b-col>
                                            <b-col>
                                                {{
                                                    Math.trunc(node.y * 100) /
                                                        100
                                                }}
                                            </b-col>
                                            <b-col>
                                                {{
                                                    Math.trunc(node.z * 100) /
                                                        100
                                                }}
                                            </b-col>
                                        </b-row>
                                    </div>
                                </div>
                            </div>
                            <b-card
                                bg-variant="secondary"
                                class="sidebar-editor"
                            >
                                <b-row>
                                    <b-col cols="3">
                                        <label>x:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedNode.x"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>y:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedNode.y"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>z:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedNode.z"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>Option:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedNode.options"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col>
                                        <b-button
                                            block
                                            variant="primary"
                                            size="sm"
                                            @click="onApplyNodeParam"
                                            >Apply</b-button
                                        >
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-tab>

                        <b-tab title="Beams">
                            <div v-if="doneLoading" class="node-table">
                                <div v-for="grp in beamsList" :key="grp.grp_id">
                                    <b-row
                                        @mousedown="onGrpMouseDown"
                                        :id="grp.grp_id"
                                    >
                                        {{ getGrpName(grp.grp_id) }}
                                    </b-row>
                                    <div
                                        v-for="(beam, idx2) in grp.beams"
                                        :key="idx2"
                                    >
                                        <b-row
                                            @mousedown="onBeamMouseDown"
                                            :data-beam-id="beam.id"
                                            :data-grp-id="beam.grp_id"
                                            :class="{
                                                active:
                                                    selectedBeam.id == beam.id
                                            }"
                                        >
                                            <b-col>{{ beam.node1 }}</b-col>
                                            <b-col>{{ beam.node2 }}</b-col>
                                            <b-col>{{ beam.options }}</b-col>
                                        </b-row>
                                    </div>
                                </div>
                            </div>
                            <b-card
                                bg-variant="secondary"
                                class="sidebar-editor"
                            >
                                <b-row>
                                    <b-col cols="3">
                                        <label>Node1</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedBeam.node1"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>Node2</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedBeam.node2"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>Option:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input
                                            type="text"
                                            size="sm"
                                            v-model="selectedBeam.options"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>Type:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-select
                                            v-model="selectedBeamType"
                                            :options="beamTypes"
                                            size="sm"
                                            disabled
                                        ></b-form-select>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col>
                                        <b-button
                                            block
                                            variant="primary"
                                            size="sm"
                                            @click="onApplyBeamParam"
                                            >Apply</b-button
                                        >
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-tab>

                        <b-tab title="Other">
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-loadBluePrints
                                >Load blueprint</b-button
                            >
                            <b-button @click="toggleBlueprint"
                                >Toggle blueprint</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-meshwireframe
                                >Load Mesh wireframe</b-button
                            >
                            <b-button @click="toggleMeshWireframe"
                                >Toggle Mesh wireframe</b-button
                            >

                            <b-button @click="resetPrespCamera"
                                >Reset 3D Camera position</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-configCameras
                                disabled
                                >Configure cameras</b-button
                            >
                            <b-button @click="toggleNodesNames"
                                >Toggle nodes names</b-button
                            >
                            <b-button @click="toggleWheelsVisibility"
                                >Toggle wheels visibility</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-configWheels
                                >wheels</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-configWheels2
                                disabled
                                >wheels2</b-button
                            >
                        </b-tab>
                    </b-tabs>
                </b-card>
            </b-col>
            <b-col class="body_col">
                <b-navbar type="dark" variant="primary">
                    <b-collapse id="nav-text-collapse" is-nav>
                        <b-navbar-nav>
                            <b-nav-form style="color: white">
                                <label for="grid_size">Grid:</label>
                                <b-form-spinbutton
                                    id="grid_size"
                                    v-model="gridFactor"
                                    inline
                                    min="0.1"
                                    max="2.1"
                                    step="0.1"
                                    v-b-tooltip.hover
                                    title="meters/gridbox"
                                ></b-form-spinbutton>
                            </b-nav-form>
                            <b-nav-form
                                style="color: white; padding-left: 0.5rem;"
                            >
                                <label for="node-size">Nodes:</label>
                                <b-form-spinbutton
                                    id="node-size"
                                    v-model="nodeSizeFactor"
                                    inline
                                    min="0"
                                    max="5"
                                    step="0.5"
                                    v-b-tooltip.hover
                                    title="Node size"
                                ></b-form-spinbutton>
                            </b-nav-form>
                        </b-navbar-nav>
                        <b-navbar-nav class="ml-auto">
                            <b-nav-item-dropdown text="File" right>
                                <b-dropdown-item @click="onSave"
                                    >Save</b-dropdown-item
                                >
                                <b-dropdown-item>Reload file</b-dropdown-item>
                                <b-dropdown-divider></b-dropdown-divider>
                                <b-dropdown-item to="/">Close</b-dropdown-item>
                            </b-nav-item-dropdown>
                        </b-navbar-nav>
                    </b-collapse>
                </b-navbar>

                <div class="editor">
                    <b-container class="editor-container" id="editorViews">
                        <b-row class="row-editor" id="topViewsRow">
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-bottom-style: solid; border-width: 1px;"
                                id="0"
                            >
                                <canvas id="myRender"></canvas>
                                <label
                                    style="position: absolute; top: 0px; left:10px;"
                                >
                                    Top</label
                                >
                                <label
                                    @mousedown="OnResizeViews"
                                    style="position: absolute; bottom: 0px; right:0px; width: 50px;"
                                >
                                    Move</label
                                >
                            </b-col>
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px; padding-left: 1px; border-bottom-style: solid; border-width: 1px;"
                                id="1"
                            >
                                <canvas id="myRender2"></canvas>
                                <label
                                    style="position: absolute; top: 0px; left:10px;"
                                >
                                    Left</label
                                >
                            </b-col>
                        </b-row>
                        <b-row class="row-editor" id="bottomViewRows">
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 1px; padding-left: 0px; border-right-style: solid; border-width: 1px;"
                                id="2"
                            >
                                <canvas id="myRender3"></canvas>
                                <label
                                    style="position: absolute; top: 0px; left:10px;"
                                >
                                    Front</label
                                >
                            </b-col>
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px; padding-left: 1px;"
                                id="3"
                            >
                                <canvas id="myRender4"></canvas>
                                <label
                                    style="position: absolute; top: 0px; left:10px;"
                                >
                                    3D <small>(Perspective)</small></label
                                >
                            </b-col>
                        </b-row>
                    </b-container>
                </div>
            </b-col>
        </b-row>
        <LoadBluePrintsModal v-bind:EditorObj="EditorObj" />
        <LoadMeshWireframeModal v-bind:EditorObj="EditorObj" />
        <ConfigCameras />
        <ConfigWheels v-bind:EditorObj="EditorObj" />
        <ConfigWheels2 v-bind:EditorObj="EditorObj" />
        <AddGroupModal
            v-bind:nodeId="addGrpNodeId"
            v-bind:EditorObj="EditorObj"
        />
        <AddGroupModalBeam
            v-bind:beamId="addGrpBeamId"
            v-bind:EditorObj="EditorObj"
        />
        <RenameGroupModal
            v-bind:grpId="renameGrpId"
            v-bind:EditorObj="EditorObj"
            v-bind:grpTitle="renameGrpTitle"
        />
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as TruckEditor from "../components/Editor/ts/TruckEditor";
import {
    TruckFileNodes,
    TruckFileBeams,
    TruckFileGroup
} from "../components/Editor/ts/TruckFileInterfaces";

import LoadBluePrintsModal from "./Editor/LoadBluePrintsModal.vue";
import LoadMeshWireframeModal from "./Editor/LoadMeshWireFrameModal.vue";
import AddGroupModal from "./Editor/addGroupModal.vue";
import AddGroupModalBeam from "./Editor/addGroupModalBeam.vue";
import RenameGroupModal from "./Editor/renameGroupModal.vue";
import ConfigCameras from "./Editor/ConfigCameras.vue";
import ConfigWheels from "./Editor/ConfigWheels.vue";
import ConfigWheels2 from "./Editor/ConfigWheels2.vue";
import { watch } from "fs";

const remote = require("electron").remote;
const { Menu, MenuItem } = remote;

//const { app, globalShortcut } = require('electron');

interface EditorNodes extends TruckFileNodes {
    is_visible: boolean;
}

interface EditorBeams extends TruckFileBeams {
    is_visible: boolean;
}

@Component({
    components: {
        LoadBluePrintsModal,
        LoadMeshWireframeModal,
        ConfigCameras,
        ConfigWheels,
        ConfigWheels2,
        AddGroupModal,
        AddGroupModalBeam,
        RenameGroupModal
    }
})
export default class Editor extends Vue {
    public EditorObj!: TruckEditor.default;

    public addGrpNodeId = -1;
    public addGrpBeamId = -1;

    public renameGrpId = -1;
    public renameGrpTitle = "";

    get nodesTruck(): TruckFileNodes[] {
        return this.$store.getters.getTruckData.nodes;
    }
    get beamsTruck(): TruckFileBeams[] {
        return this.$store.getters.getTruckData.beams;
    }
    get groups(): TruckFileGroup[] {
        return this.$store.getters.getTruckData.groups;
    }

    private nodesList: {
        grp_id: number;
        nodes: EditorNodes[];
        is_visible: boolean;
    }[] = [];

    private beamsList: {
        grp_id: number;
        beams: EditorBeams[];
        is_visible: boolean;
    }[] = [];

    private doneLoading = false;

    private currGroupId = -1;

    private isDone_Param = false;

    private selectedNode: EditorNodes = {
        id: "-1",
        x: 0,
        y: 0,
        z: 0,
        options: "",
        idEditor: -1,

        grp_id: -1,
        comment_id: -1,
        sbd_preset_id: -1,
        snd_preset_id: -1,
        is_visible: true
    };

    private selectedBeam: EditorBeams = {
        node1: "-1",
        node2: "-1",
        id: -1,
        is_visible: true,
        grp_id: -1,
        comment_id: -1,
        sbd_preset_id: -1,
        snd_preset_id: -1
    };

    private update = false;

    private gridFactor = 1;
    private nodeSizeFactor = 1;

    /**
     *
     * We define our renders here
     *
     */
    width = 810;
    height = 450;

    private renders: TruckEditor.RenderInterface[] = [
        {
            id: 0,
            canvas: "myRender",
            type: "top",
            width: this.width,
            height: this.height
        },
        {
            id: 1,
            canvas: "myRender2",
            type: "side",
            width: this.width,
            height: this.height
        },
        {
            id: 2,
            canvas: "myRender3",
            type: "front",
            width: this.width,
            height: this.height
        },
        {
            id: 3,
            canvas: "myRender4",
            type: "full",
            width: this.width,
            height: this.height
        }
    ];

    /**
     * UI Specific stuff
     */
    private selectedBeamType = null;
    private beamTypes = [
        { value: null, text: "Beam" },
        { value: "shock", text: "Shock" },
        { value: "hydro", text: "Hydro" },
        { value: "cmd", text: "Command" }
    ];

    @Watch("nodesTruck")
    updateNodesData() {
        let lastGrp = -1;

        this.nodesList = [];
        this.nodesList.push({
            grp_id: -1,
            is_visible: true,
            nodes: []
        });

        console.log("updateNodesData");
        if (Array.isArray(this.nodesTruck)) {
            console.log(this.groups);

            this.nodesTruck!.forEach(node => {
                if (node.grp_id != lastGrp) {
                    this.nodesList.push({
                        grp_id: node.grp_id,
                        is_visible: true,
                        nodes: []
                    });
                    lastGrp = node.grp_id;
                }
            });

            this.nodesTruck!.forEach(node => {
                if (this.nodesList.some(el => el.grp_id == node.grp_id)) {
                    const newNode: EditorNodes = node as EditorNodes;
                    newNode.is_visible = true;

                    this.nodesList
                        .filter(el => el.grp_id == node.grp_id)[0]
                        .nodes.push(newNode);
                }
            });
        }

        //Select first node
        if (this.selectedNode.idEditor == -1) {
            let index = 0;

            if (this.nodesList[index].nodes.length == 0) {
                index++;
            }

            this.setNodeEditor(
                this.nodesList[index].grp_id,
                this.nodesList[index].nodes[0].idEditor
            );
        } else {
            //we update the current selected node.
            this.setNodeEditor(
                this.selectedNode.grp_id,
                this.selectedNode.idEditor
            );
        }
    }

    @Watch("beamsTruck")
    updateBeamsData() {
        let lastGrp = -1;

        this.beamsList = [];

        this.beamsList.push({
            grp_id: -1,
            is_visible: true,
            beams: []
        });

        if (Array.isArray(this.beamsTruck)) {
            this.beamsTruck!.forEach(beam => {
                if (beam.grp_id != lastGrp) {
                    this.beamsList.push({
                        grp_id: beam.grp_id,
                        is_visible: true,
                        beams: []
                    });
                    lastGrp = beam.grp_id;
                }
            });

            this.beamsTruck!.forEach(beam => {
                if (this.beamsList.some(el => el.grp_id == beam.grp_id)) {
                    const newBeam: EditorBeams = beam as EditorBeams;
                    newBeam.is_visible = true;

                    this.beamsList
                        .filter(el => el.grp_id == beam.grp_id)[0]
                        .beams.push(newBeam);
                }
            });
        }

        //Select first beam
        if (this.selectedBeam.id == -1) {
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

    created() {
        this.EditorObj = new TruckEditor.default();
    }

    mounted() {
        this.EditorObj.setRenders(this.renders);
        this.$store.dispatch("setEditor", this.EditorObj);

        document.addEventListener("keydown", e => this.EditorObj.keyDown(e));
        document.addEventListener("keyup", e => this.EditorObj.keyUp(e));
        if (this.$route.query.load) {
            this.EditorObj.loadTruckFile();
        }

        window.addEventListener(
            "resize",
            () => this.EditorObj.onWindowResize(),
            false
        );

        this.doneLoading = true;

        this.mainLoop();

        document.addEventListener("keydown", event => {
            if (event.ctrlKey && event.key === "z") {
                this.EditorObj.requestUndo();
            }
        });
    }

    mainLoop() {
        this.EditorObj.updateRenders();

        requestAnimationFrame(this.mainLoop);
    }

    onMouseDown(event: TruckEditor.MouseEvent2) {
        this.EditorObj.onMouseDown(event);
    }

    onMouseUp(event: MouseEvent) {
        this.EditorObj.onMouseUp(event as any);
    }

    onDblClick(event: MouseEvent) {
        this.EditorObj.onDblClick(event as any);
    }

    resetPrespCamera() {
        this.EditorObj.resetPrespCamera();
    }

    toggleNodesNames() {
        this.EditorObj.toggleNodesNames();
    }

    @Watch("update")
    emitObj() {
        this.$root.$emit("setEditorObj", this.EditorObj);
    }

    @Watch("gridFactor")
    updateGridFactor() {
        this.EditorObj.setGridFactor(this.gridFactor);
    }

    @Watch("nodeSizeFactor")
    updateNodeSizeFactor() {
        this.EditorObj.setNodeSizeFactor(this.nodeSizeFactor);
    }

    onSave() {
        this.EditorObj.requestSave();
    }

    setNodeEditor(grp_id: number, nodeId: number) {
        if (grp_id == undefined) return;

        if (this.nodesList) {
            Object.assign(
                this.selectedNode,
                this.nodesList
                    .filter(el => el.grp_id == grp_id)[0]
                    .nodes.filter(el => el.idEditor == nodeId)[0]
            );
        }
    }

    setBeamEditor(grp_id: number, beamId: number) {
        if (grp_id == undefined) return;

        if (this.nodesList) {
            Object.assign(
                this.selectedBeam,
                this.beamsList
                    .filter(el => el.grp_id == grp_id)[0]
                    .beams.filter(el => el.id == beamId)[0]
            );
        }
    }

    toggleBlueprint() {
        this.EditorObj.toggleBlueprint();
    }

    toggleMeshWireframe() {
        this.EditorObj.toggleMeshWireframe();
    }

    getGrpName(grp: number) {
        if (grp == -1) return;

        const title = this.groups?.filter(el => el.grp_id == grp)[0].title;
        return "grp: " + title;
    }

    log(data: any) {
        console.log(data);
    }

    onApplyNodeParam() {
        console.log("apply");
        if (this.nodesList) {
            const node = this.nodesTruck.filter(
                el => el.idEditor == this.selectedNode.idEditor
            )[0];

            node.x = this.selectedNode.x;
            node.y = this.selectedNode.y;
            node.z = this.selectedNode.z;
            node.options = this.selectedNode.options;

            this.$store.dispatch("applyUINodesData", this.nodesTruck);
        }
    }

    onApplyBeamParam() {
        console.log("apply");
        if (this.beamsList) {
            const beam = this.beamsTruck.filter(
                el => el.id == this.selectedBeam.id
            )[0];

            beam.node1 = this.selectedBeam.node1;
            beam.node2 = this.selectedBeam.node2;
            beam.options = this.selectedBeam.options;
            //TODO: support for types

            this.$store.dispatch("applyUIBeamsData", this.beamsTruck);
        }
    }

    onGrpMouseDown(e: TruckEditor.MouseEvent2) {
        const menu = new Menu();
        if (e.button == 2) {
            menu.append(
                new MenuItem({
                    label: "Rename group",
                    click: () => {
                        this.renameGrp(
                            parseInt(e.target?.id.replace("grp-", ""))
                        );
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

    renameGrp(grp_id: number) {
        this.renameGrpId = grp_id;
        this.renameGrpTitle = this.groups.filter(
            el => el.grp_id == grp_id
        )[0].title;

        this.$bvModal.show("modal-renameGrp");
    }

    addGrp_node(el: TruckEditor.MouseEvent2) {
        /**
         * FIX: For some reasons, typescript does not recognize parentNode from mouse Target.
         * we should find a correct solution as I'm just bypassing the "error" here.
         */

        // @ts-ignore
        this.addGrpNodeId = parseInt(el.target.parentNode.dataset.nodeId);

        this.$bvModal.show("modal-addGrp");
    }

    addGrp_beam(el: TruckEditor.MouseEvent2) {
        /**
         * FIX: For some reasons, typescript does not recognize parentNode from mouse Target.
         * we should find a correct solution as I'm just bypassing the "error" here.
         */

        // @ts-ignore
        this.addGrpBeamId = parseInt(el.target.parentNode.dataset.beamId);
        console.log(this.addGrpBeamId);

        this.$bvModal.show("modal-addGrpBeam");
    }

    onNodeMouseDown(e: TruckEditor.MouseEvent2) {
        let data;
        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        if (e.button == 0) {
            this.setNodeEditor(data.grpId, data.nodeId);
        } else if (e.button == 2) {
            const menu = new Menu();
            if (e.button == 2) {
                menu.append(
                    new MenuItem({
                        label: "Add new group before node",
                        click: () => {
                            this.addGrp_node(e);
                        }
                    })
                );
                menu.append(new MenuItem({ type: "separator" }));
                menu.append(
                    new MenuItem({
                        label: "Delete node",
                        click: () => {
                            console.log("delete node!");
                        }
                    })
                );
                menu.popup({
                    window: remote.getCurrentWindow()
                });
            }
        }
    }

    onBeamMouseDown(e: TruckEditor.MouseEvent2) {
        let data;
        if (e.path[0].dataset.length == 3) {
            data = e.path[0].dataset;
        } else {
            data = e.path[1].dataset;
        }

        if (e.button == 0) {
            this.setBeamEditor(data.grpId, data.beamId);
        } else if (e.button == 2) {
            const menu = new Menu();
            if (e.button == 2) {
                menu.append(
                    new MenuItem({
                        label: "Add new group before beam",
                        click: () => {
                            this.addGrp_beam(e);
                        }
                    })
                );
                menu.append(new MenuItem({ type: "separator" }));
                menu.append(
                    new MenuItem({
                        label: "Delete beam",
                        click: () => {
                            console.log("delete beam!");
                        }
                    })
                );
                menu.popup({ window: remote.getCurrentWindow() });
            }
        }
    }

    onCheckNode(id: any) {
        console.log("hai der: " + id);
    }

    OnResizeViews(e: TruckEditor.MouseEvent2) {
        e.preventDefault();
        console.log("OnResizeViews");

        document
            .getElementById("editorViews")!
            .addEventListener("mousemove", this.resize);
        document
            .getElementById("editorViews")!
            .addEventListener("mouseup", this.stopResize);
    }

    /**
     * To be honnest
     * I have no idea how I did this but it "works"
     */
    resize(e: MouseEvent) {
        /**horizental resizing */

        const ratio = (e.clientX - 225) / (window.innerWidth - 225);
        const calc1 = e.clientX - 225;

        const calc2 = window.innerWidth - e.clientX;

        if (ratio < 0.5) {
            document.getElementById("1")!.style.maxWidth = "100%";
            document.getElementById("3")!.style.maxWidth = "100%";

            document.getElementById("0")!.style.maxWidth =
                calc1.toString() + "px";
            document.getElementById("2")!.style.maxWidth =
                calc1.toString() + "px";
        } else {
            document.getElementById("0")!.style.maxWidth =
                calc1.toString() + "px";
            document.getElementById("2")!.style.maxWidth =
                calc1.toString() + "px";

            document.getElementById("1")!.style.maxWidth =
                calc2.toString() + "px";
            document.getElementById("3")!.style.maxWidth =
                calc2.toString() + "px";
        }

        /** vertical resizing */
        const ratioV =
            (e.clientY - 40) / (window.innerHeight - 40) +
            24 / window.innerHeight;
        document.getElementById("topViewsRow")!.style.height =
            ratioV * 100 + "%";

        document.getElementById("bottomViewRows")!.style.height =
            (1 - ratioV) * 100 + "%";

        this.EditorObj.onWindowResize();
    }

    stopResize(e: MouseEvent) {
        document
            .getElementById("editorViews")!
            .removeEventListener("mousemove", this.resize);
    }

    toggleWheelsVisibility() {
        this.EditorObj.toggleWheelsVisibility();
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";

.body_row {
    margin-right: 0 !important;
}
.body_col {
    padding: 0 !important;
}

.editor > .container > .row > .col {
    //    height: 458px;
    //  width: 810px;
}

.coloraaa {
    color: #0000005e;
}

.editor-container {
    height: 100%;
    //margin-top: 10px;
    .row {
        height: 50%;

        margin-bottom: 10px;
    }
    .col {
        //height: 100%;

        height: 100%;
        canvas {
            //border: 1px $secondary solid;
            height: 100%;
            width: 100%;
            display: block;
        }
    }
}

.editor {
    //100% - 40px navbar
    //margin-top: -8px;
    height: calc(100vh - 40px);
    overflow: hidden;
    //height: 100vh ;
}

body {
    //overflow: hidden;
}

.sidebar_menu_card {
    height: 100%;
    min-height: 100vh;
    max-height: 100vh;
    border: 0 !important;
    box-shadow: 5px 0px 5px rgba(0, 0, 0, 0.082);
    z-index: 10;
}

.sidebar_header {
    height: 40px;
    background-color: $primary;
    //margin-bottom: 10px;
}

.hr_line {
    height: 5px;
    border-top: 3px solid;
    border-color: #381d46;
}

.card_body_sidebar_avatar {
    padding: 1.25rem;
    padding-bottom: 0.5rem;
}

.sidebar_avatar p {
    padding-left: 10px;
    display: inline-block;
}

.sidebar_nav {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

.nav-tabs {
    background-color: $primary;
}

.node-table {
    overflow: auto !important;
    min-height: calc(100vh - 82px - 160px);
    max-height: calc(100vh - 82px - 160px);

    .row {
        margin: 0;
        padding: 0px 5px;
        .col {
            padding-right: 0;
            padding-left: 10px;
            overflow: hidden;
            max-width: 7ch;
        }
        &:hover {
            background-color: $secondary;
            color: white;
        }
    }

    .active {
        background-color: $primary;
        color: white;
    }
}

.sidebar-editor {
    font-size: 14px;
    .card-body {
        padding: 0.5rem 1rem 0.5rem 1rem;
    }
}

.wheels-list {
    height: 200px;
    .row {
        color: white;
        background-color: $secondary;
        &:hover {
            background-color: $primary;
        }
    }
}
</style>

<style lang="scss" scoped>
.navbar {
    padding: 0rem 1rem;
}
.row-editor {
    margin-bottom: 0px;
}

canvas:focus {
    outline: none;
}
</style>
