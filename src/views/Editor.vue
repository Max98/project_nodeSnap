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
                                <div
                                    v-for="(node, idx) in nodesTruck"
                                    :key="idx"
                                >
                                    <b-row
                                        @click="setNodeEditor(node)"
                                        :class="{
                                            active: selectedNode.id == node.id
                                        }"
                                    >
                                        <b-col>{{ node.id }}</b-col>
                                        <b-col>{{
                                            Math.trunc(node.x * 100) / 100
                                        }}</b-col>
                                        <b-col>{{
                                            Math.trunc(node.y * 100) / 100
                                        }}</b-col>
                                        <b-col>{{
                                            Math.trunc(node.z * 100) / 100
                                        }}</b-col>
                                    </b-row>
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
                                            >Apply</b-button
                                        >
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-tab>

                        <b-tab title="Beams">
                            <div v-if="doneLoading" class="node-table">
                                <div
                                    v-for="(beam, idx2) in beamsTruck"
                                    :key="idx2"
                                >
                                    <b-row>
                                        <b-col>{{ beam.node1 }}</b-col>
                                        <b-col>{{ beam.node2 }}</b-col>
                                        <b-col>{{ beam.options }}</b-col>
                                    </b-row>
                                </div>
                            </div>
                        </b-tab>

                        <b-tab title="Other">
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-loadBluePrints
                                >Load blueprint</b-button
                            >
                            <b-button @click="resetPrespCamera"
                                >Reset 3D Camera position</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-configCameras
                                >Configure cameras</b-button
                            >
                            <b-button @click="toggleNodesNames"
                                >Toggle nodes names</b-button
                            >
                            <b-button
                                @mousedown="update = !update"
                                v-b-modal.modal-configWheels2
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
                                <label for="sb-inline">Grid:&nbsp;</label>
                                <b-form-spinbutton
                                    id="sb-inline"
                                    v-model="gridFactor"
                                    inline
                                    min="0.1"
                                    max="2.1"
                                    step="0.1"
                                ></b-form-spinbutton
                                >&nbsp;meters/Grid Box
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
                    <b-container class="editor-container">
                        <b-row class="row-editor">
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                                id="0"
                            >
                                <canvas id="myRender"></canvas>
                            </b-col>
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                                id="1"
                            >
                                <canvas id="myRender2"></canvas>
                            </b-col>
                        </b-row>
                        <b-row class="row-editor">
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                                id="2"
                            >
                                <canvas id="myRender3"></canvas>
                            </b-col>
                            <b-col
                                @mousedown="onMouseDown"
                                @mouseup="onMouseUp"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                                id="3"
                            >
                                <canvas id="myRender4"></canvas>
                            </b-col>
                        </b-row>
                    </b-container>
                </div>
            </b-col>
        </b-row>
        <LoadBluePrintsModal />
        <ConfigCameras />
        <ConfigWheels2 />
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as TruckEditor from "../components/Editor/ts/TruckEditor";
import {
    TruckFileNodes,
    TruckFileBeams
} from "../components/Editor/ts/TruckFileParser";

import LoadBluePrintsModal from "./Editor/LoadBluePrintsModal.vue";
import ConfigCameras from "./Editor/ConfigCameras.vue";
import ConfigWheels2 from "./Editor/ConfigWheels2.vue";

@Component({
    components: {
        LoadBluePrintsModal,
        ConfigCameras,
        ConfigWheels2
    }
})
export default class Editor extends Vue {
    public EditorObj!: TruckEditor.default;

    private nodesTruck: TruckFileNodes[] | null = null;
    private beamsTruck: TruckFileBeams[] | null = null;

    private doneLoading = false;

    private selectedNode: TruckFileNodes = {
        id: "0",
        x: 0,
        y: 0,
        z: 0,
        options: ""
    };

    private update = false;

    private gridFactor = 1;

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

    mounted() {
        this.EditorObj = new TruckEditor.default(this.renders);
        document.addEventListener("keydown", e => this.EditorObj.keyDown(e));
        document.addEventListener("keyup", e => this.EditorObj.keyUp(e));
        if (this.$route.query.load) {
            this.EditorObj.loadTruckFile(this.$store.getters.getTruckData);
        }

        window.addEventListener(
            "resize",
            () => this.EditorObj.onWindowResize(),
            false
        );

        this.nodesTruck = this.$store.getters.getTruckData.nodes;
        this.beamsTruck = this.$store.getters.getTruckData.beams;

        this.doneLoading = true;

        this.mainLoop();
    }

    mainLoop() {
        this.EditorObj.updateRenders();

        requestAnimationFrame(this.mainLoop);
    }

    onMouseDown(event: TruckEditor.MouseEvent2) {
        this.EditorObj.onMouseDown(event);
    }

    onMouseUp(event: MouseEvent) {
        this.EditorObj.onMouseUp(event);
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

    onSave() {
        this.EditorObj.requestSave();
    }

    setNodeEditor(node: TruckFileNodes) {
        this.selectedNode = node;
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
    margin-top: 10px;
    .row {
        height: 50%;
        max-height: 50%;
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
    //100% - 40px navbar - 10px margin top
    height: calc(100vh - 70px);
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
</style>
