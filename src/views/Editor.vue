<template>
    <div>
        <b-row class="body_row">
            <b-col class="side_bar_col">
                <b-card variant="dark" no-body class="sidebar_menu_card">
                    <div class="sidebar_header">
                        <p
                            class="font-weight-light"
                            style="padding: 5px 20px; font-size: 20px; color: white; text-align: center;"
                        >rorEditor</p>
                    </div>

                    <b-tabs>
                        <b-tab title="Nodes" active>
                            <div v-if="doneLoading" class="node-table">
                                <div v-for="(node, idx) in nodesTruck" :key="idx">
                                    <b-row
                                        @click="setNodeEditor(node)"
                                        :class="{
                                            active: editorNodeId == node.id
                                        }"
                                    >
                                        <b-col>{{ node.id }}</b-col>
                                        <b-col>{{ Math.trunc(node.x * 100) / 100 }}</b-col>
                                        <b-col>{{ Math.trunc(node.y * 100) / 100 }}</b-col>
                                        <b-col>{{ Math.trunc(node.z * 100) / 100 }}</b-col>
                                    </b-row>
                                </div>
                            </div>
                            <b-card bg-variant="secondary" class="sidebar-editor">
                                <b-row>
                                    <b-col cols="3">
                                        <label>x:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input type="text" size="sm" v-model="editorNodeX"></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>y:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input type="text" size="sm" v-model="editorNodeY"></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col cols="3">
                                        <label>z:</label>
                                    </b-col>
                                    <b-col>
                                        <b-form-input type="text" size="sm" v-model="editorNodeZ"></b-form-input>
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
                                            v-model="editorNodeOption"
                                        ></b-form-input>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col>
                                        <b-button block variant="primary" size="sm">Apply</b-button>
                                    </b-col>
                                </b-row>
                            </b-card>
                        </b-tab>

                        <b-tab title="Beams">
                            <div v-if="doneLoading" class="node-table">
                                <div v-for="(beam, idx2) in beamsTruck" :key="idx2">
                                    <b-row>
                                        <b-col>{{ beam.node1 }}</b-col>
                                        <b-col>{{ beam.node2 }}</b-col>
                                        <b-col>{{ beam.options }}</b-col>
                                    </b-row>
                                </div>
                            </div>
                        </b-tab>

                        <b-tab title="Other">
                            <b-button v-b-modal.modal-1>Load blueprint</b-button>
                            <b-button @click="resetPrespCamera">Reset 3D Camera position</b-button>
                            <b-button v-b-modal.modal-2>Configure cameras</b-button>
                            <b-button @click="toggleNodesNames">Toggle nodes names</b-button>
                            <b-button v-b-modal.modal-3>wheels2</b-button>
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
                                    @change="updateGrids"
                                ></b-form-spinbutton>&nbsp;meters/Grid Box
                            </b-nav-form>
                        </b-navbar-nav>
                        <b-navbar-nav class="ml-auto">
                            <b-nav-item-dropdown text="File" right>
                                <b-dropdown-item @click="requestSave">Save</b-dropdown-item>
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
                                <canvas @wheel="onwheel" id="myRender"></canvas>
                            </b-col>
                            <b-col
                                @mousedown="setRender(1)"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                            >
                                <canvas id="myRender2"></canvas>
                            </b-col>
                        </b-row>
                        <b-row class="row-editor">
                            <b-col
                                @mousedown="setRender(2)"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                            >
                                <canvas id="myRender3"></canvas>
                            </b-col>
                            <b-col
                                @mousedown="setRender(3)"
                                @dblclick="onDblClick"
                                style="padding-right: 0px;"
                            >
                                <canvas id="myRender4"></canvas>
                            </b-col>
                        </b-row>
                    </b-container>
                </div>
            </b-col>
        </b-row>
        <b-modal
            id="modal-1"
            title="BootstrapVue"
            @ok="loadBluePrints"
            cancel-title="remove"
            @cancel="removeBluePrints"
        >
            <b-form-file
                v-model="bluePrintFile"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
            ></b-form-file>
        </b-modal>
        <b-modal id="modal-2" title="BootstrapVue" size="lg">
            <b-form>
                <h4>Thrid view camera</h4>
                <b-row v-if="doneLoading">
                    <b-col>
                        <b-form-group label="Center node">
                            <b-form-input v-model="cameras.centerNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Back node">
                            <b-form-input v-model="cameras.backNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Left node">
                            <b-form-input v-model="cameras.leftNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-form>
            <b-form>
                <h4>Cinecam</h4>
                <b-row v-if="doneLoading">
                    <b-col>
                        <b-form-group label="X">
                            <b-form-input v-model="cinecam.x"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Y">
                            <b-form-input v-model="cinecam.y"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Z">
                            <b-form-input v-model="cinecam.z"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Node 1">
                            <b-form-input v-model="cinecam.node1"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 2">
                            <b-form-input v-model="cinecam.node2"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 3">
                            <b-form-input v-model="cinecam.node3"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 4">
                            <b-form-input v-model="cinecam.node4"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 5">
                            <b-form-input v-model="cinecam.node5"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 6">
                            <b-form-input v-model="cinecam.node6"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 7">
                            <b-form-input v-model="cinecam.node7"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 8">
                            <b-form-input v-model="cinecam.node8"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-form>
        </b-modal>
        <b-modal id="modal-3" title="BootstrapVue" cancel-title="remove" size="lg">
            <div v-if="doneLoading" class="wheels-list">
                <div v-for="(wheel, idx) in wheels2" :key="idx">
                    <b-row @click="setSelectedWheel2(wheel)">
                        <b-col>Wheel {{idx + 1}}, node1: {{wheel.node1}}, node2: {{wheel.node2}}</b-col>
                    </b-row>
                </div>
            </div>
            <div v-if="selectedWheel2">
                <b-row>
                    <b-col>
                        <b-form-group label="Mass">
                            <b-form-input v-model="selectedWheel2.mass"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim radius">
                            <b-form-input v-model="selectedWheel2.rimRadius"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Tyre radius">
                            <b-form-input v-model="selectedWheel2.tyreRadius"></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col>
                        <b-form-group label="Number of rays">
                            <b-form-input v-model="selectedWheel2.numRays"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Node 1">
                            <b-form-input v-model="selectedWheel2.node1"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 2">
                            <b-form-input v-model="selectedWheel2.node2"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rigidity Node">
                            <b-form-input v-model="selectedWheel2.rigNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Reference arm node">
                            <b-form-input v-model="selectedWheel2.refArmNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Tyre Springiness">
                            <b-form-input v-model="selectedWheel2.tyreSpringness"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Tyre Damping">
                            <b-form-input v-model="selectedWheel2.tyreDamping"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim springiness">
                            <b-form-input v-model="selectedWheel2.rimSpringness"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim damping">
                            <b-form-input v-model="selectedWheel2.rimDamping"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Wheel braking">
                            <b-form-input v-model="selectedWheel2.braking"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Wheel drive">
                            <b-form-input v-model="selectedWheel2.braking"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Material">
                            <b-form-input v-model="selectedWheel2.material"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </div>
            <b-button @click="addNewWheel2">Add</b-button>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import * as THREE from "three";

//We use our own camera modifed from the original OrbitCamera class from three.js
import { OrbitControls } from "../components/Editor/js/EditorOrbitCamera.js";

import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import Stats from "../components/Editor/js/stats.module.js";

import * as TRUCK from "../components/Editor/ts/TruckFileParser";

import { Color, Colors, Vector3, Vector2 } from "three";

import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import fs from "fs";

interface RenderInterface {
    readonly id: number;
    readonly canvas: string;
    readonly type: string;
    width: number;
    height: number;
    worker?: THREE.WebGLRenderer;
    cameraOrtho?: THREE.OrthographicCamera;
    cameraPersp?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
    mouse?: THREE.Vector2;
    raycaster?: THREE.Raycaster;
    debugStats?: any;
}

interface DragControlEvents extends THREE.Event {
    object?: THREE.Mesh;
}

interface MouseEvent2 extends MouseEvent {
    path: any[];
}

@Component({
    components: {}
})
export default class Editor extends Vue {
    private scene!: any; //TODO change any to THREE.Scene and fix TS errors
    private dragControl?: DragControls[] = [];
    private gridIntersect: THREE.Mesh[] = [];
    private nodesTruck: TRUCK.TruckFileNodes[] = [];
    private beamsTruck: TRUCK.TruckFileBeams[] = [];

    /**
     * Init some stuff if new truck
     */
    private cameras: TRUCK.TruckFileCameras = {
        centerNode: "0",
        backNode: "1",
        leftNode: "2"
    };

    private cinecam: TRUCK.TruckFileCineCam = {
        x: 0,
        y: 0,
        z: 0,
        node1: "0",
        node2: "1",
        node3: "2",
        node4: "3",
        node5: "4",
        node6: "5",
        node7: "6",
        node8: "7"
    };

    private wheels2: TRUCK.TruckFileWheels2[] = [];

    private nodeObject: THREE.Sprite[] = [];

    private nodesText: any[] = [];
    private geoBeamsArray: any = [];
    private selectedNode?: THREE.Mesh = undefined;
    private renderId = -1;

    //im being lazy here
    private beamsLineMesh: any;
    private isNodeDrag = false;
    private hoverNode?: THREE.Mesh = undefined;

    /**
     *
     * User configs
     *
     */
    private renderOptions = {
        renderNodesNames: false,
        antiAlias: false,
        debugStatistics: false,

        //this is used to make positions actually in a sweet spot for the render
        //THIS IS NOT FOR SCALING N/B
        nodePosRenderScale: 60
    };

    doneLoading = false;

    /**
     *
     * We define our renders here
     *
     */
    width = 810;
    height = 450;

    private gridFactor = 1;

    private renders: RenderInterface[] = [
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
        /**
         * Setup scene and grids
         * Create renders..
         */
        this.initialize();
        this.createRenders();

        /**
         * Load truck file data and get it ready
         * for rendering
         */

        if (this.$route.query.load) {
            this.setTruckFileJson(this.$store.getters.getTruckData);
            this.LoadTruckJson();
            this.buildBeamsLines(true); //init param

            this.doneLoading = true;
            this.setNodeEditor(this.nodesTruck[0]);
        } else {
            this.doneLoading = true;
        }

        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);

        /**
         * one frame update then loop
         */
        this.requestAllRendersUpdate();
        this.executeRender();
    }

    toggleNodesNames() {
        this.renderOptions.renderNodesNames = !this.renderOptions
            .renderNodesNames;

        if (this.renderOptions.renderNodesNames == false) {
            this.nodesText.forEach(element => {
                this.scene.remove(element);
            });
        }

        this.buildBeamsLines();
        this.requestAllRendersUpdate();
    }

    onwheel() {
        /**
         *
         * Infinite grid system?
         *
         */
        /*  console.log(this.renders[0].cameraOrtho.zoom);

        let factor = 100;

        if (this.renders[0].cameraOrtho.zoom >= 20) {
            factor = 6.25;
            this.grid.scale.set(0.25, 0.25, 0.25);
        } else if (this.renders[0].cameraOrtho.zoom >= 10) {
            factor = 12.5;
            this.grid.scale.set(0.25, 0.25, 0.25);
        } else if (this.renders[0].cameraOrtho.zoom > 4) {
            factor = 25;
        } else if (this.renders[0].cameraOrtho.zoom > 2) {
            factor = 50;
        } else if (this.renders[0].cameraOrtho.zoom > 1) {
            factor = 100;
        } else if (this.renders[0].cameraOrtho.zoom < 0.5) {
            factor = 200;
        } else if (this.renders[0].cameraOrtho.zoom < 0.25) {
            factor = 400;
        } else if (this.renders[0].cameraOrtho.zoom < 0.125) {
            factor = 800;
        }

        this.grid.scale.set(factor * 0.01, factor * 0.01, factor * 0.01);*/
    }

    private isShiftKey = false;
    private dragBluePrintKey = false;

    keyDown(event: KeyboardEvent) {
        this.isShiftKey = event.shiftKey;
        this.dragBluePrintKey = event.ctrlKey && event.key == "b";

        //console.log(event.shiftKey);
    }

    keyUp(event: KeyboardEvent) {
        //console.log(event.shiftKey);
        this.isShiftKey = event.shiftKey;
        this.dragBluePrintKey = event.ctrlKey && event.key == "b";
    }

    private gridSize = 9720;
    private gridDivisions = 160;

    private gridTop?: THREE.GridHelper = undefined;
    private gridFront?: THREE.GridHelper = undefined;
    private gridSide?: THREE.GridHelper = undefined;

    initialize() {
        this.scene = new THREE.Scene();

        this.gridTop = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("red"),
            0x272727
        );
        this.gridTop.position.set(0, -8000, 0);
        this.scene.add(this.gridTop);

        this.gridFront = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("green"),
            0x272727
        );
        this.gridFront.position.set(-8000, 0, 0);
        this.gridFront.rotateZ(Math.PI / 2);
        this.scene.add(this.gridFront);

        this.gridSide = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("blue"),
            0x272727
        );
        this.gridSide.position.set(0, 0, -8000);
        this.gridSide.rotateX(Math.PI / 2);
        this.scene.add(this.gridSide);

        /**
         *
         * Planes for raytracing with mouse to snap nodes
         *
         */
        //Top
        let geometry = new THREE.PlaneBufferGeometry(
            this.gridSize,
            this.gridSize
        );
        geometry.rotateX(-Math.PI / 2);
        let plane = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        plane.position.set(0, 0, 0);
        this.scene.add(plane);
        this.gridIntersect.push(plane);

        //side
        geometry = new THREE.PlaneBufferGeometry(this.gridSize, this.gridSize);
        //geometry.rotateX(Math.PI / 2);
        plane = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        plane.position.set(0, 0, 0);
        this.scene.add(plane);
        this.gridIntersect.push(plane);

        //front
        geometry = new THREE.PlaneBufferGeometry(this.gridSize, this.gridSize);
        // geometry.rotateZ(45);
        geometry.rotateY(Math.PI / 2);
        plane = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        plane.position.set(0, 0, 0);
        this.scene.add(plane);
        this.gridIntersect.push(plane);

        /**
         *
         * Something for the 3D render?
         * TODO improve this
         *
         */
        const axesHelper = new THREE.AxesHelper(100);
        axesHelper.rotateY(Math.PI);
        axesHelper.rotateX(-Math.PI / 2);
        this.scene.add(axesHelper);
    }

    updateGrids() {
        this.gridTop!.scale.set(
            this.gridFactor,
            this.gridFactor,
            this.gridFactor
        );

        this.gridSide!.scale.set(
            this.gridFactor,
            this.gridFactor,
            this.gridFactor
        );

        this.gridFront!.scale.set(
            this.gridFactor,
            this.gridFactor,
            this.gridFactor
        );

        this.requestAllRendersUpdate();
    }

    resetPrespCamera() {
        this.renders[3].cameraPersp!.position.set(-300, 200, 200);
    }

    private bluePrintFile: File | null = null;
    private BluePrintControls: DragControls[] = [];
    private bluePrintArray: any[] = [];

    async loadBluePrints() {
        if (!this.bluePrintFile) return;

        const dataURI = fs.readFileSync(this.bluePrintFile.path, "base64");
        console.log(this.bluePrintFile.type);

        const imgData = `data:${this.bluePrintFile.type};base64,` + dataURI;

        const texture = new THREE.TextureLoader().load(imgData);
        texture.anisotropy = 16;

        const dimensions: {
            w: number;
            h: number;
        } = await this.getImageDimensions(imgData);
        console.log(dimensions);
        const bluePrintPlanes: any = [];

        this.renders.forEach(render => {
            if (render.type == "full") return;

            const material = new THREE.MeshBasicMaterial({ map: texture });
            const geometryPlane = new THREE.PlaneGeometry(
                dimensions.w,
                dimensions.h
            );

            bluePrintPlanes[render.id] = new THREE.Mesh(
                geometryPlane,
                material
            );
            this.bluePrintArray.push(bluePrintPlanes[render.id]);

            switch (render.type) {
                case "top":
                    bluePrintPlanes[render.id].position.setX(-8001);
                    bluePrintPlanes[render.id].rotateY(Math.PI / 2);
                    break;
                case "side":
                    bluePrintPlanes[render.id].position.setZ(-8001);
                    break;
                case "front":
                    bluePrintPlanes[render.id].rotateX(-Math.PI / 2);
                    bluePrintPlanes[render.id].position.setY(-8001);
                    break;
                default:
                    break;
            }

            this.scene.add(bluePrintPlanes[render.id]);
            this.requestAllRendersUpdate();
        });

        this.renders.forEach(render => {
            if (render.type == "full") return;

            this.BluePrintControls[render.id] = new DragControls(
                this.bluePrintArray,
                this.renders[render.id].cameraOrtho as THREE.Camera,
                this.renders[render.id].worker?.domElement
            );

            this.BluePrintControls[render.id].enabled = false;
        });
    }

    removeBluePrints() {
        this.bluePrintArray.forEach(bluPrt => {
            this.scene.remove(bluPrt);
        });
        this.bluePrintArray = [];
        this.BluePrintControls.forEach(element => {
            element.deactivate();
            element.dispose();
        });
    }

    getImageDimensions(file: string): { w: number; h: number } | any {
        return new Promise(function(resolved, rejected) {
            const i = new Image();
            i.onload = function() {
                resolved({ w: i.width, h: i.height });
            };
            i.src = file;
        });
    }

    private truckFileData!: TRUCK.TruckFileInterface;

    private setTruckFileJson(JsonData: TRUCK.TruckFileInterface) {
        this.truckFileData = JsonData;

        this.nodesTruck = JsonData.nodes!;
        this.beamsTruck = JsonData.beams!;

        if (JsonData.cameras) this.cameras = JsonData.cameras!;

        if (JsonData.cineCam) this.cinecam = JsonData.cineCam!;

        if (JsonData.wheels2) this.wheels2 = JsonData.wheels2;

        ////console.log(this.beamsTruck);
    }

    LoadTruckJson() {
        //reset datas

        this.nodeObject.forEach(element => {
            this.scene.remove(element);
        });

        this.nodeObject = [];
        this.geoBeamsArray = [];

        /**
         * prefere for() loop to keep stuff in order
         */

        for (let i = 0; i < this.nodesTruck.length; i++) {
            //console.log("loadTruckJson:", i);
            const currNode = this.nodesTruck[i];

            if (currNode.idEditor == undefined) {
                return;
            }

            const spriteMaterial = new THREE.SpriteMaterial({
                color: "green"
            });

            spriteMaterial.name = currNode.idEditor + "_mat";

            this.nodeObject[currNode.idEditor] = new THREE.Sprite(
                spriteMaterial
            );
            this.nodeObject[currNode.idEditor].scale.set(4, 4, 1.0);

            this.nodeObject[currNode.idEditor].position.set(
                currNode.x * this.renderOptions.nodePosRenderScale,
                currNode.y * this.renderOptions.nodePosRenderScale,
                currNode.z * this.renderOptions.nodePosRenderScale
            );

            this.nodeObject[currNode.idEditor].name = currNode.id.toString();

            this.scene!.add(this.nodeObject[currNode.idEditor]);

            //console.log("loadTruckJson", currNode.idEditor);

            //TODO SUPPORT FOR NODES2
        }

        /**
         * nodes names
         */
        if (this.renderOptions.renderNodesNames) {
            if (this.nodesText.length != 0) {
                this.nodesText.forEach(element => {
                    this.scene.remove(element);
                });
            }
            this.nodesTruck.forEach(currNode => {
                const spritey = this.makeTextSprite(currNode.id.toString());

                spritey?.position.set(
                    currNode.x * this.renderOptions.nodePosRenderScale,
                    currNode.y * this.renderOptions.nodePosRenderScale,
                    currNode.z * this.renderOptions.nodePosRenderScale
                );

                this.scene.add(spritey!);
            });
        }

        /**
         * Self explenatory
         */
        this.renders.forEach(render => {
            this.createDragNodes(render);
        });

        for (let i = 0; i < this.beamsTruck.length; i++) {
            ////console.log(i);
            const beamData = this.beamsTruck[i];

            const pt = [];

            //two nodes in a beam so we generate the nodes
            for (let index = 0; index < 2; index++) {
                let nodeKey: string = beamData.node1.toString();

                if (index == 1) {
                    nodeKey = beamData.node2.toString();
                }

                let currNode: TRUCK.TruckFileNodes;

                this.nodesTruck.forEach(nodeEl => {
                    if (nodeEl.id == nodeKey) {
                        currNode = nodeEl;
                    }
                });

                if (currNode! == undefined) return;
                if (currNode.idEditor! == undefined) return;

                //its already defined
                pt[index] = this.nodeObject[currNode.idEditor].position;
            }

            //and we make our beam using two points (two nodes posiiton)
            const geometry = new THREE.BufferGeometry().setFromPoints([
                pt[0],
                pt[1]
            ]);
            this.geoBeamsArray.push(geometry);
        }

        /**
         *
         * Wheels?
         */

        if (this.wheels2.length != 0) {
            this.wheelsMeshArray.forEach(element => {
                this.scene.remove(element);
            });

            this.wheels2.forEach(wheel => {
                this.buildWheelCyl(
                    this.getNodeByName(wheel.node1) as TRUCK.TruckFileNodes,
                    this.getNodeByName(wheel.node2) as TRUCK.TruckFileNodes,
                    wheel.numRays,
                    wheel.tyreRadius
                );
            });
        }
    }

    getNodeByName(str: string): TRUCK.TruckFileNodes | undefined {
        let node: TRUCK.TruckFileNodes | undefined;

        this.nodesTruck.forEach(currNode => {
            if (currNode.id == str) {
                node = currNode;
            }
        });

        if (node == undefined) return undefined;

        return node;
    }

    /**
     *
     * Some help from
     * https://stackoverflow.com/a/25769902/10382446
     *
     */

    private wheelsMeshArray: THREE.LineSegments[] = [];

    buildWheelCyl(
        node1: TRUCK.TruckFileNodes,
        node2: TRUCK.TruckFileNodes,
        numRays: number,
        radius: number
    ) {
        const node1Pos = new THREE.Vector3(
            node1.x * this.renderOptions.nodePosRenderScale,
            node1.y * this.renderOptions.nodePosRenderScale,
            node1.z * this.renderOptions.nodePosRenderScale
        );
        const node2Pos = new THREE.Vector3(
            node2.x * this.renderOptions.nodePosRenderScale,
            node2.y * this.renderOptions.nodePosRenderScale,
            node2.z * this.renderOptions.nodePosRenderScale
        );

        const width = node1Pos.distanceTo(node2Pos);

        radius *= this.renderOptions.nodePosRenderScale;

        const geometry = new THREE.CylinderBufferGeometry(
            radius,
            radius,
            width,
            numRays
        );

        const orientation = new THREE.Matrix4();
        orientation.lookAt(node1Pos, node2Pos, new THREE.Object3D().up);
        const matrix = new THREE.Matrix4();
        matrix.set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
        orientation.multiply(matrix);

        console.log(orientation);

        const wireframe = new THREE.WireframeGeometry(geometry);

        const cylinder = new THREE.LineSegments(wireframe);

        cylinder.applyMatrix4(orientation);

        cylinder.position.x = (node2Pos.x + node1Pos.x) / 2;
        cylinder.position.y = (node2Pos.y + node1Pos.y) / 2;
        cylinder.position.z = (node2Pos.z + node1Pos.z) / 2;

        this.wheelsMeshArray.push(cylinder);
        this.scene.add(cylinder);
    }

    buildBeamsLines(init = false) {
        if (!init) {
            //remove old from scene
            this.scene!.remove(this.beamsLineMesh);
            this.LoadTruckJson();
        }

        if (this.geoBeamsArray.length == 0) return;

        const lineMaterial = new THREE.LineBasicMaterial({
            color: "#7e543e"
        });

        let geometryLines = new THREE.BufferGeometry();

        geometryLines = BufferGeometryUtils.mergeBufferGeometries(
            this.geoBeamsArray
        );

        this.beamsLineMesh = new THREE.LineSegments(
            geometryLines,
            lineMaterial
        );
        this.beamsLineMesh.name = "beamLines";
        this.scene!.add(this.beamsLineMesh);
    }

    private reload() {
        this.buildBeamsLines();
        //console.log("reloaded beams");
    }

    private createRenders() {
        this.renders.forEach(render => {
            const canvas = document.querySelector(
                "#" + render.canvas
            ) as HTMLCanvasElement;

            render.worker = new THREE.WebGLRenderer({
                canvas,
                antialias: true
            });

            render.worker.setSize(
                canvas.clientWidth,
                canvas.clientHeight,
                false
            );

            //console.log("lol", canvas.clientHeight);

            if (render.type != "full") {
                render.cameraOrtho = new THREE.OrthographicCamera(
                    canvas.width / -2,
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.height / -2,
                    0.1,
                    10000
                );
                render.cameraOrtho.lookAt(0, 0, 0);
            } else {
                render.cameraPersp = new THREE.PerspectiveCamera(
                    45,
                    canvas.width / canvas.height,
                    0.1,
                    5000
                );
                render.cameraPersp.lookAt(0, 0, 0);
            }

            switch (render.type) {
                case "top":
                    render.cameraOrtho!.position.set(0, 500, 0);
                    break;
                case "side":
                    render.cameraOrtho!.position.set(0, 0, 500);
                    break;
                case "front":
                    render.cameraOrtho!.position.set(500, 0, 0);
                    break;

                case "full":
                    render.cameraPersp!.position.set(-300, 200, 200);
                    break;

                default:
                    break;
            }

            render.controls = new OrbitControls(
                (render.cameraPersp as THREE.Camera) ||
                    (render.cameraOrtho as THREE.Camera),
                render.worker.domElement
            );

            if (render.type != "full") {
                render.controls.enableRotate = false;
                render.controls.screenSpacePanning = true;
            }

            render.mouse = new THREE.Vector2();
            render.raycaster = new THREE.Raycaster();

            render.controls.update();

            document.addEventListener("mousemove", this.onMouseMouve, false);

            //TODO typescript cires about new Stats()

            if (this.renderOptions.debugStatistics) {
                render.debugStats = Stats();
                render.worker.domElement.parentElement!.appendChild(
                    render.debugStats.dom
                );
            }
        });

        window.addEventListener("resize", this.onWindowResize, false);
    }

    onWindowResize() {
        this.renders.forEach(render => {
            const canvas = render.worker!.domElement;
            const parent = canvas.parentElement;
            const box = canvas.getBoundingClientRect();

            ////console.log(canvas.clientWidth);

            if (render.type != "full") {
                if (render.cameraOrtho == undefined) return;

                render.cameraOrtho.left = canvas.clientWidth / -2;
                render.cameraOrtho.right = canvas.clientWidth / 2;
                render.cameraOrtho.top = canvas.clientHeight / 2;
                render.cameraOrtho.bottom = canvas.clientHeight / -2;

                render.cameraOrtho.updateProjectionMatrix();
                //render.worker.setSize(parent.clientWidth, parent.clientHeight);

                //render.camera!.aspect = canvas.clientWidth / canvas.clientHeight;
                //render.camera!.updateProjectionMatrix();
            } else {
                if (render.cameraPersp == undefined) return;
                render.cameraPersp.aspect =
                    canvas.clientWidth / canvas.clientHeight;
                render.cameraPersp.updateProjectionMatrix();
            }

            //console.log("lol2", canvas.clientHeight);

            render.worker!.setPixelRatio(window.devicePixelRatio);

            render.worker!.setSize(box.width, box.height, false);
        });

        this.requestAllRendersUpdate();
    }

    private createDragNodes(render: RenderInterface) {
        // if (render.type == "full") return;
        if (this.dragControl == undefined) {
            return;
        }

        if (this.dragControl[render.id] != undefined) {
            this.dragControl[render.id].removeEventListener(
                "hoveron",
                this.hoverOn
            );
            this.dragControl[render.id].removeEventListener(
                "hoveroff",
                this.hoverOff
            );
            this.dragControl[render.id].removeEventListener(
                "dragstart",
                this.dragStart
            );
            this.dragControl[render.id].removeEventListener(
                "dragend",
                this.dragEnd
            );
            this.dragControl[render.id].dispose();

            //console.log(this.dragControl);
        }

        if (render.type == "full") {
            this.dragControl[render.id] = new DragControls(
                [...this.nodeObject],
                render.cameraPersp!,
                render.worker!.domElement
            );
        } else {
            this.dragControl[render.id] = new DragControls(
                [...this.nodeObject],
                render.cameraOrtho!,
                render.worker!.domElement
            );
        }

        this.dragControl[render.id].addEventListener("hoveron", this.hoverOn);
        this.dragControl[render.id].addEventListener("hoveroff", this.hoverOff);
        this.dragControl[render.id].addEventListener(
            "dragstart",
            this.dragStart
        );
        this.dragControl[render.id].addEventListener("dragend", this.dragEnd);
    }

    private tempBeamLine?: THREE.Line = undefined;

    hoverOn(event: any) {
        //console.log(event);
        event.object.material.color.g = 0;
        event.object.material.color.r = 1;
        event.object.material.color.b = 0;

        this.hoverNode = event.object;

        if (this.selectedNode && this.isShiftKey && this.hoverNode) {
            if (this.hoverNode.name == this.selectedNode.name) return;

            //TODO maybe memeory leak here
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const points = [];
            points.push(this.selectedNode.position);
            points.push(this.hoverNode.position);

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.tempBeamLine = new THREE.Line(geometry, material);
            this.scene.add(this.tempBeamLine);

            this.requestAllRendersUpdate();
        }
    }

    hoverOff(event: any) {
        event.object.material.color.g = 0.5;
        event.object.material.color.r = 0;
        event.object.material.color.b = 0;

        this.hoverNode = undefined;

        this.scene.remove(this.tempBeamLine);

        if (this.tempBeamLine) {
            //this.scene.remove(this.tempBeamLine);
            //this.tempBeamLine = undefined;
            this.requestAllRendersUpdate();
        }
    }

    private lastSelectedNode?: THREE.Mesh = undefined;

    dragStart(event: any) {
        // if (event.object.type == "Sprite") return;

        if (this.renderId == 3 && !this.isShiftKey) {
            this.renders[3].controls!.enabled = false;
        }

        event.object.material.color.g = 1;
        event.object.material.color.b = 0;
        event.object.material.color.r = 0;

        this.selectedNode = event.object;

        if (this.lastSelectedNode && this.selectedNode) {
            if (this.isShiftKey) {
                this.createBeam(this.lastSelectedNode, this.selectedNode);
                this.selectedNode = undefined;
                this.lastSelectedNode = undefined;
            }
        }

        this.isNodeDrag = true;
    }

    getLastBeamId(): number {
        let id = -1;
        this.beamsTruck.forEach(beamEl => {
            if (beamEl.id! > id) {
                id = beamEl.id!;
            }
        });

        return id;
    }

    createBeam(node1: THREE.Mesh, node2: THREE.Mesh) {
        if (node1.name == node2.name) {
            this.$bvToast.toast("Zero-length beam detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });
            return;
        }

        let isDuplicate = false;

        this.beamsTruck.forEach(beamEl => {
            if (beamEl.node1 == node1.name && beamEl.node2 == node2.name) {
                isDuplicate = true;
            } else if (
                beamEl.node1 == node2.name &&
                beamEl.node2 == node1.name
            ) {
                isDuplicate = true;
            }
        });

        if (isDuplicate) {
            this.$bvToast.toast("Duplicated beam detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });
            return;
        }

        this.beamsTruck.push({
            node1: node1.name.toString(),
            node2: node2.name.toString(),
            id: this.getLastBeamId() + 1
        });

        console.log(this.beamsTruck);

        this.LoadTruckJson();
        this.buildBeamsLines();

        console.log(node1.name + ", " + node2.name);
    }

    dragEnd(event: any) {
        //if (event.object.type == "Sprite") return;
        if (this.renderId == 3) {
            this.renders[3].controls!.enabled = true;
        }

        event.object.material.color.g = 0.5;
        event.object.material.color.b = 0;
        event.object.material.color.r = 0;

        if (this.isShiftKey) {
            this.lastSelectedNode = this.selectedNode;
        } else {
            this.lastSelectedNode = undefined;
        }

        //this.selectedNode = undefined;
        //console.log("selectednode:", this.selectedNode);

        this.isNodeDrag = false;
        this.updateBeams(event.object);
    }

    /**
     * This happens on mouse key down to update the selected render
     * Work for all three mouse buttons
     */
    setRender(id: number) {
        this.renderId = id;
        //console.log("Render: ", this.renderId);
        //console.log(this.renders[0].worker!.info);
    }

    onMouseDown(event: MouseEvent2) {
        this.setRender(event.path[1].id);

        /**
         * We disable dragable stuff on right click
         */
        //right click
        if (event.button == 2) {
            this.renders.forEach(render => {
                this.dragControl![render.id].enabled = false;
            });
        }
    }
    onMouseUp(event: MouseEvent) {
        console.log(event);

        /**
         *
         * we enable them again
         */
        //right click
        if (event.button == 2) {
            this.renders.forEach(render => {
                this.dragControl![render.id].enabled = true;
            });
        }
    }

    /**
     * This happens on mousekey up
     * only left click
     */
    onDblClick(event: DragControlEvents) {
        this.renders.forEach(render => {
            if (this.renderId != render.id) {
                return;
            }
            if (render.cameraOrtho == undefined) {
                return;
            }

            //console.log(event.ctrlKey);

            render.mouse!.set(
                ((event.clientX - event.target.getBoundingClientRect().x) /
                    render.worker!.domElement.clientWidth) *
                    2 -
                    1,
                -(
                    (event.clientY - event.target.getBoundingClientRect().y) /
                    render.worker!.domElement.clientHeight
                ) *
                    2 +
                    1
            );

            render.raycaster!.setFromCamera(render.mouse!, render.cameraOrtho!);

            const intersects = render.raycaster?.intersectObjects(
                this.gridIntersect
            );

            if (intersects!.length > 0) {
                const intersect = intersects![0];

                //We snap to grid on CTRL

                //grid snap
                if (event.ctrlKey) {
                    let Pos;
                    const ScalarFactor = 30 * this.gridFactor;
                    switch (render.type) {
                        case "top":
                            Pos = new Vector2(
                                intersect.point.x,
                                intersect.point.z
                            );
                            Pos.divideScalar(ScalarFactor)
                                .floor()
                                .multiplyScalar(ScalarFactor);

                            this.addNewNode({
                                x: Pos.x,
                                y: 0,
                                z: Pos.y
                            });
                            break;
                        case "side":
                            Pos = new Vector2(
                                intersect.point.x,
                                intersect.point.y
                            );
                            Pos.divideScalar(ScalarFactor)
                                .floor()
                                .multiplyScalar(ScalarFactor);

                            this.addNewNode({
                                x: Pos.x,
                                y: Pos.y,
                                z: 0
                            });
                            break;

                        case "front":
                            Pos = new Vector2(
                                intersect.point.z,
                                intersect.point.y
                            );
                            Pos.divideScalar(ScalarFactor)
                                .floor()
                                .multiplyScalar(ScalarFactor);

                            this.addNewNode({
                                x: 0,
                                y: Pos.y,
                                z: Pos.x
                            });
                            break;
                        default:
                            break;
                    }
                } else {
                    this.addNewNode({
                        x: intersect.point.x,
                        y: intersect.point.y,
                        z: intersect.point.z
                    });
                }
            }
        });
    }

    getLastNodeId(): number {
        let i = -1;
        this.nodesTruck.forEach(nodeEl => {
            if (nodeEl.idEditor! > i) i = nodeEl.idEditor!;
        });

        return i;
    }

    addNewNode(position: { x: number; y: number; z: number }) {
        //console.log(this.getLastNodeId()); // this.nodesTruck[]

        let isDuplicate = false;

        this.nodesTruck.forEach(currNode => {
            let bx,
                by,
                bz = false;

            if (
                currNode.x ==
                position.x / this.renderOptions.nodePosRenderScale
            ) {
                bx = true;
            }
            if (
                currNode.y ==
                position.y / this.renderOptions.nodePosRenderScale
            ) {
                by = true;
            }
            if (
                currNode.z ==
                position.z / this.renderOptions.nodePosRenderScale
            ) {
                bz = true;
            }

            if (bx && by && bz) {
                isDuplicate = true;
            }
        });

        if (isDuplicate) {
            this.$bvToast.toast("Duplicate node detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });
            return;
        }

        const nodeId = this.getLastNodeId() + 1;

        this.nodesTruck.push({
            id: nodeId.toString(),
            idEditor: nodeId,
            x: position.x / this.renderOptions.nodePosRenderScale,
            y: position.y / this.renderOptions.nodePosRenderScale,
            z: position.z / this.renderOptions.nodePosRenderScale
        });

        this.LoadTruckJson();

        ////console.log(this.nodeObject);

        this.requestAllRendersUpdate();
    }

    private virtualBeam: any = undefined;

    onMouseMouve(event: DragControlEvents) {
        this.renders.forEach(render => {
            if (this.renderId != render.id) {
                return;
            }
            if (render.cameraOrtho == undefined) {
                return;
            }

            //console.log(this.selectedNode);

            if (this.isNodeDrag) {
                render.mouse!.set(
                    ((event.clientX - event.target.getBoundingClientRect().x) /
                        render.worker!.domElement.clientWidth) *
                        2 -
                        1,
                    -(
                        (event.clientY -
                            event.target.getBoundingClientRect().y) /
                        render.worker!.domElement.clientHeight
                    ) *
                        2 +
                        1
                );

                ////console.log(render.mouse);

                render.raycaster!.setFromCamera(
                    render.mouse!,
                    render.cameraOrtho!
                );

                const intersects = render.raycaster?.intersectObjects(
                    this.gridIntersect
                );

                if (intersects!.length > 0) {
                    const intersect = intersects![0];

                    //We snap to grid on CTRL
                    if (this.selectedNode != undefined) {
                        this.requestAllRendersUpdate();
                        //console.log("render");

                        if (event.ctrlKey) {
                            //this.selectedNode.position.copy(intersect.point);

                            let ScalarFactor = 30 * this.gridFactor;

                            //we make the grid half smaller on CTRL + ALT
                            if (event.altKey) {
                                ScalarFactor = 15 * this.gridFactor;
                            }

                            let Pos;

                            switch (render.type) {
                                case "top":
                                    Pos = new Vector2(
                                        this.selectedNode.position.x,
                                        this.selectedNode.position.z
                                    );
                                    Pos.divideScalar(ScalarFactor)
                                        .floor()
                                        .multiplyScalar(ScalarFactor);
                                    this.selectedNode.position.setX(Pos.x);
                                    this.selectedNode.position.setZ(Pos.y);
                                    break;
                                case "side":
                                    Pos = new Vector2(
                                        this.selectedNode.position.x,
                                        this.selectedNode.position.y
                                    );
                                    Pos.divideScalar(ScalarFactor)
                                        .floor()
                                        .multiplyScalar(ScalarFactor);
                                    this.selectedNode.position.setX(Pos.x);
                                    this.selectedNode.position.setY(Pos.y);
                                    break;

                                case "front":
                                    Pos = new Vector2(
                                        this.selectedNode.position.z,
                                        this.selectedNode.position.y
                                    );
                                    Pos.divideScalar(ScalarFactor)
                                        .floor()
                                        .multiplyScalar(ScalarFactor);
                                    this.selectedNode.position.setZ(Pos.x);
                                    this.selectedNode.position.setY(Pos.y);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
        });
    }

    updateBeams(obj: {
        name: any;
        position: { x: number; y: number; z: number };
    }) {
        //node number
        //console.log("onUpdateBeams.obj.name ", obj.name);

        if (obj == undefined) return;

        const node: any = this.nodesTruck.filter(
            node => node.id == obj.name
        )[0];

        //console.log("before", node);

        node.x = obj.position.x * (1 / this.renderOptions.nodePosRenderScale);
        node.y = obj.position.y * (1 / this.renderOptions.nodePosRenderScale);
        node.z = obj.position.z * (1 / this.renderOptions.nodePosRenderScale);

        //console.log("after", node);

        this.buildBeamsLines();
        this.requestAllRendersUpdate();

        //filter beams and select only those affected by our node
        //let data = this.beamsTruck.filter(p => p.node1 == obj.name);
        /*
        data.forEach(element => {
            if (this.scene.getObjectById(element.id) == undefined) return;

            const position = this.scene.getObjectById(element.id).geometry
                .attributes.position;
            position.usage = THREE.DynamicDrawUsage;
            position.array[0] = obj.position["x"];
            position.array[1] = obj.position["y"];
            position.array[2] = obj.position["z"];
            position.needsUpdate = true;
        });

        //other side of the story
        data = this.beamsTruck.filter(p => p.node2 == obj.name);

        //console.log(data);

        data.forEach(element => {
            if (this.scene.getObjectById(element.id) == undefined) return;

            const position = this.scene.getObjectById(element.id).geometry
                .attributes.position;
            position.usage = THREE.DynamicDrawUsage;
            position.array[3] = obj.position["x"];
            position.array[4] = obj.position["y"];
            position.array[5] = obj.position["z"];
            position.needsUpdate = true;
        });*/
    }

    requestAllRendersUpdate() {
        this.renders.forEach(render => {
            if (this.renderId != render.id) {
                //this.createDragNodes(render);
                render.worker!.render(
                    this.scene,
                    render.cameraOrtho || (render.cameraPersp as THREE.Camera)
                );
            }
        });
    }

    private clock = new THREE.Clock();
    private delta = 0;
    private loopTime = 0;

    executeRender() {
        this.delta = this.clock.getDelta();
        this.loopTime += this.delta;

        this.renders.forEach(render => {
            render.controls!.update();
            if (this.renderOptions.debugStatistics) render.debugStats.update();
            if (render.id == this.renderId) {
                render.worker!.render(
                    this.scene,
                    render.cameraOrtho || (render.cameraPersp as THREE.Camera)
                );
            }
        });

        if (this.loopTime >= 0.1) {
            this.updateKeys();
            this.loopTime = 0;
        }

        requestAnimationFrame(this.executeRender);
    }

    updateKeys() {
        this.renders.forEach(render => {
            if (render.type == "full") return;

            if (this.BluePrintControls[render.id]) {
                if (this.dragBluePrintKey) {
                    this.BluePrintControls[render.id].enabled = true;
                } else {
                    this.BluePrintControls[render.id].enabled = false;
                }
            }
        });
    }

    beforeDestroy() {
        this.nodesTruck = [];
        this.beamsTruck = [];
    }

    updateNodes() {
        //console.log("");
    }

    /*
    Author: Lee Stemkoski
    Just made it work since it was from 2013
    */

    makeTextSprite(message: string) {
        const parameters = {
            fontface: "Arial",
            fontsize: 24
        };

        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d");
        if (context == null) return;

        context.font = "" + parameters.fontsize + "px " + parameters.fontface;

        // get size data (height depends only on font size)
        const metrics = context.measureText(message);
        const textWidth = metrics.width;

        // background color
        context.fillStyle = "rgba(0,0,0,0)";

        // border color
        context.strokeStyle = "rgba(0,0,0,0)";

        this.roundRect(context, 0, 0, textWidth, parameters.fontsize * 1.4, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(255,255,255, 1.0)";

        context.fillText(message, 0, parameters.fontsize!);

        // canvas contents will be used for a texture
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(200, 100, 1.0);
        sprite.center.set(0.2, 0.95);

        this.nodesText.push(sprite);

        return sprite;
    }

    roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /**
     * UI stuff
     */

    private editorNodeId: any = 0;
    private editorNodeX = 0;
    private editorNodeY = 0;
    private editorNodeZ = 0;
    private editorNodeOption = "";

    setNodeEditor(node: TRUCK.TruckFileNodes) {
        this.editorNodeId = node.id;
        this.editorNodeX = node.x;
        this.editorNodeY = node.y;
        this.editorNodeZ = node.z;
        if (node.options) {
            this.editorNodeOption = node.options;
        }
    }

    private selectedWheel2!: any;

    setSelectedWheel2(wheel: TRUCK.TruckFileWheels2) {
        this.selectedWheel2 = wheel;
    }

    addNewWheel2() {
        this.wheels2.push({
            mass: 280,
            width: 0,
            rimRadius: 0.3,
            tyreRadius: 0.6,
            numRays: 16,
            node1: "0",
            node2: "1",
            rigNode: "9999",
            refArmNode: "0",
            tyreSpringness: 400000,
            tyreDamping: 2000,
            rimSpringness: 900000,
            rimDamping: 200,
            braking: 1,
            drive: 0,
            material: "tracks/daffwheelface tracks/dafwheelband"
        });
        this.setSelectedWheel2(this.wheels2[this.wheels2.length - 1]);
    }

    requestSave() {
        /*if (!this.truckFileData) {
            this.truckFileData = {
                info: { title: "", authors: [] },
                globals: { cargoMass: 1, dryMass: 1, material: "" }
            };
        }
        //push back modded data
        this.truckFileData.nodes = this.nodesTruck;
        this.truckFileData.beams = this.beamsTruck;
        */

        this.$store.dispatch("setTruckNB", {
            nodes: this.nodesTruck,
            beams: this.beamsTruck
        });

        this.$store.dispatch("setTruckCameras", {
            cameras: this.cameras,
            cinecam: this.cinecam
        });

        console.log(this.$store.getters.getTruckData);

        const truckParser = new TRUCK.default();
        truckParser.saveFile("");
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
