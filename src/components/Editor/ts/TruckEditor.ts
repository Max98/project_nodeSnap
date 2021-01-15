import * as THREE from "three";

//We use our own camera modifed from the original OrbitCamera class from three.js
import { OrbitControls } from "../js/EditorOrbitCamera.js";

import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import Stats from "../js/stats.module.js";

import * as Parser from "./TruckFileParser2";
import * as TRUCK from "./TruckFileInterfaces";

import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import fs from "fs";

import store from "@/store/index";

const remote = require("electron").remote;
const { Menu, MenuItem, dialog } = remote;

import OgreLoader from "../ts/OgreLoader";

export interface RenderInterface {
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

/**
 * Typescript's library is missing the 'path' proprety
 * This is a quick fix
 */
interface Target extends EventTarget {
    id: string;
    getBoundingClientRect(): {
        bottom: number;
        height: number;
        left: number;
        right: number;
        top: number;
        width: number;
        x: number;
        y: number;
    };
}

export interface MouseEvent2 extends MouseEvent {
    path: any[];
    target: Target;
}

interface WheelWireFrame {
    node1: string;
    node2: string;
    numRays: number;
    tyreRadius: number;
}

interface HistorySystem {
    fn: string;
    data: string;
}

/**
 * Main editor code
 */
export default class TruckEditor {
    /**
     *
     * render propreties
     *
     */
    private scene!: THREE.Scene;
    private rendersArray!: RenderInterface[];
    private currActiveRenderId = -1;

    private clock!: THREE.Clock;
    private delta = 0;
    private loopTime = 0;

    private isReadyRenders = false;

    private nodeSpriteScale = 4;

    private ogreLoader!: OgreLoader;

    private HistorySystem: HistorySystem[] = [];

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

    /**
     *
     * Basic stuff
     *
     */

    private gridSize = 9720;
    private gridDivisions = 160;

    private gridTop?: THREE.GridHelper = undefined;
    private gridFront?: THREE.GridHelper = undefined;
    private gridSide?: THREE.GridHelper = undefined;

    private gridIntersect: THREE.Mesh[] = [];

    private gridFactor = 1;

    /**
     *
     *
     *
     */

    private dragControl?: DragControls[] = [];
    private truckFileData!: TRUCK.TruckFileInterface;
    private nodesTruck: TRUCK.TruckFileNodes[] = [];
    private beamsTruck: TRUCK.TruckFileBeams[] = [];
    private nodeObject: THREE.Sprite[] = [];

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

    //private wheels2: TRUCK.TruckFileWheels2[] = [];
    private wheelWireFrame: WheelWireFrame[] = [];

    /**
     *
     * methods
     *
     */

    constructor() {
        console.log("EditorObj");
    }

    public setRenders(renders: RenderInterface[]) {
        this.rendersArray = renders;

        this.scene = new THREE.Scene();
        this.populateScene();
        this.createRenders();

        //And done
        this.clock = new THREE.Clock(true);
        this.isReadyRenders = true;
        this.requestAllRendersUpdate();
    }

    private populateScene() {
        this.gridTop = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("red"),
            0x272727
        );
        this.gridTop.position.set(0, -12200, 0);
        this.scene.add(this.gridTop);

        this.gridFront = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("green"),
            0x272727
        );
        this.gridFront.position.set(-12000, 0, 0);
        this.gridFront.rotateZ(-Math.PI / 2);
        this.scene.add(this.gridFront);

        this.gridSide = new THREE.GridHelper(
            this.gridSize,
            this.gridDivisions,
            new THREE.Color("blue"),
            0x272727
        );
        this.gridSide.position.set(0, 0, -12500);
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

    private createRenders() {
        this.rendersArray.forEach(render => {
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

            if (render.type != "full") {
                render.cameraOrtho = new THREE.OrthographicCamera(
                    canvas.width / -2,
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.height / -2,
                    0.1,
                    100000
                );
                render.cameraOrtho.lookAt(0, 0, 0);
            } else {
                render.cameraPersp = new THREE.PerspectiveCamera(
                    45,
                    canvas.width / canvas.height,
                    0.1,
                    9000
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
                    render.cameraOrtho!.position.set(2500, 0, 0);
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

            if (this.renderOptions.debugStatistics) {
                render.debugStats = Stats();
                render.worker.domElement.parentElement!.appendChild(
                    render.debugStats.dom
                );
            }
        });

        document.addEventListener("mousemove", e => this.onMouseMove(e as any));

        //window.addEventListener("resize", this.onWindowResize, false);
    }

    public requestAllRendersUpdate() {
        this.rendersArray.forEach(render => {
            if (this.currActiveRenderId != render.id) {
                //this.createDragNodes(render);
                render.worker!.render(
                    this.scene,
                    render.cameraOrtho || (render.cameraPersp as THREE.Camera)
                );
            }
        });
    }

    public updateRenders() {
        if (!this.isReadyRenders) return;

        this.delta = this.clock.getDelta();
        this.loopTime += this.delta;

        this.rendersArray.forEach(render => {
            render.controls!.update();
            if (this.renderOptions.debugStatistics) render.debugStats.update();

            if (render.id == this.currActiveRenderId) {
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

        //requestAnimationFrame(this.executeRender);
    }

    private updateKeys() {
        this.rendersArray.forEach(render => {
            if (render.type == "full") return;

            if (this.BluePrintControls[render.id]) {
                if (this.isKeyComb.dragBluePrintKey) {
                    this.BluePrintControls[render.id].enabled = true;
                } else {
                    this.BluePrintControls[render.id].enabled = false;
                }
            }
        });
    }

    private setRender(id: number) {
        this.currActiveRenderId = id;
    }

    /**
     *
     * Mouse events
     *
     */
    private isMouseMove = false;
    public onMouseDown(event: MouseEvent2) {
        this.setRender(event.path[1].id);

        this.isMouseMove = false;

        /**
         * We disable dragable stuff on right click
         */
        //right click
        if (event.button == 2) {
            this.rendersArray.forEach(render => {
                if (this.dragControl == undefined) return;
                if (this.dragControl[render.id] == undefined) return;

                this.dragControl![render.id].enabled = false;
            });
        }
    }
    public onMouseUp(event: MouseEvent2) {
        /**
         *
         * we enable them again
         */
        //right click
        if (event.button == 2) {
            if (!this.isMouseMove) {
                this.rendersArray.forEach(render => {
                    if (this.currActiveRenderId != render.id) {
                        return;
                    }
                    if (render.cameraOrtho == undefined) {
                        return;
                    }
                    render.mouse!.set(
                        ((event.clientX -
                            event.target.getBoundingClientRect().x) /
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

                    render.raycaster!.setFromCamera(
                        render.mouse!,
                        render.cameraOrtho!
                    );

                    const intersects = render.raycaster?.intersectObjects(
                        this.nodeObject
                    );
                    const menu = new Menu();
                    if (intersects!.length > 0) {
                        const intersect = intersects![0];
                        menu.append(
                            new MenuItem({
                                label: "Delete node",
                                click: () => {
                                    this.deleteNodeByThreeObj(intersect.object);
                                }
                            })
                        );
                        menu.popup({
                            window: remote.getCurrentWindow()
                        });
                    }
                });
            }

            this.rendersArray.forEach(render => {
                if (this.dragControl == undefined) return;
                if (this.dragControl[render.id] == undefined) return;

                this.dragControl[render.id].enabled = true;
            });
        }
    }

    private deleteNodeByThreeObj(obj: THREE.Object3D) {
        this.nodesTruck = this.nodesTruck.filter(
            el => el.idEditor != parseInt(obj.name)
        );

        this.beamsTruck = this.beamsTruck.filter(el => el.node1 != obj.name);
        this.beamsTruck = this.beamsTruck.filter(el => el.node2 != obj.name);

        this.nodeObject = this.nodeObject.filter(el => el != obj);

        for (let index = 0; index < this.nodesTruck.length; index++) {
            const element = this.nodesTruck[index];
            element.id = index.toString();
        }
        for (let index = 0; index < this.beamsTruck.length; index++) {
            const element = this.beamsTruck[index];
            element.id = index;
        }

        this.scene.remove(obj);

        this.buildBeamsLines();
        this.requestAllRendersUpdate();
    }

    private deleteNodeById(id: string) {
        this.deleteNodeByThreeObj(this.scene.getObjectByName(id)!);
    }

    private deleteBeamById(id: string) {
        this.beamsTruck = this.beamsTruck.filter(el => el.id != parseInt(id));
        this.buildBeamsLines();
        this.requestAllRendersUpdate();
    }

    public onMouseMove(event: MouseEvent2) {
        if (this.currActiveRenderId == undefined) return;
        this.isMouseMove = true;

        this.rendersArray.forEach(render => {
            if (this.currActiveRenderId != render.id) {
                return;
            }
            if (render.cameraOrtho == undefined) {
                return;
            }

            if (this.isNodeDrag) {
                const intersects = render.raycaster?.intersectObjects(
                    this.gridIntersect
                );

                if (intersects!.length > 0) {
                    const intersect = intersects![0];

                    //We snap to grid on CTRL
                    if (this.selectedNode != undefined) {
                        this.requestAllRendersUpdate();

                        if (this.isKeyComb.isCtrlKey) {
                            //this.selectedNode.position.copy(intersect.point);

                            let ScalarFactor = 30 * this.gridFactor;

                            //we make the grid half smaller on CTRL + ALT
                            if (event.altKey) {
                                ScalarFactor = 15 * this.gridFactor;
                            }

                            let Pos;

                            switch (render.type) {
                                case "top":
                                    Pos = new THREE.Vector2(
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
                                    Pos = new THREE.Vector2(
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
                                    Pos = new THREE.Vector2(
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

    public onWindowResize() {
        this.rendersArray.forEach(render => {
            const canvas = render.worker!.domElement;
            const parent = canvas.parentElement;
            const box = canvas.getBoundingClientRect();

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

            render.worker!.setPixelRatio(window.devicePixelRatio);

            render.worker!.setSize(box.width, box.height, false);
        });

        this.requestAllRendersUpdate();
    }

    public onDblClick(event: MouseEvent2) {
        this.rendersArray.forEach(render => {
            if (event.target == null) return;

            if (this.currActiveRenderId != render.id) {
                return;
            }
            if (render.cameraOrtho == undefined) {
                return;
            }

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
                if (this.isKeyComb.isCtrlKey) {
                    let Pos;
                    const ScalarFactor = 30 * this.gridFactor;
                    switch (render.type) {
                        case "top":
                            Pos = new THREE.Vector2(
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
                            Pos = new THREE.Vector2(
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
                            Pos = new THREE.Vector2(
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

    /**
     *
     * Keyboard events
     *
     */

    private isKeyComb = {
        isShiftKey: false,
        isCtrlKey: false,
        dragBluePrintKey: false
    };

    public keyDown(event: KeyboardEvent) {
        this.isKeyComb.isShiftKey = event.shiftKey;
        this.isKeyComb.isCtrlKey = event.ctrlKey;
        this.isKeyComb.dragBluePrintKey = event.ctrlKey && event.key == "b";
    }

    public keyUp(event: KeyboardEvent) {
        this.isKeyComb.isShiftKey = event.shiftKey;
        this.isKeyComb.isCtrlKey = event.ctrlKey;
        this.isKeyComb.dragBluePrintKey = event.ctrlKey && event.key == "b";
    }

    /*
    Author: Lee Stemkoski
    Just made it work since it was from 2013
    */

    private makeTextSprite(message: string) {
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

        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(200, 100, 1.0);
        sprite.center.set(0.2, 0.95);

        this.nodesText.push(sprite);

        return sprite;
    }

    private roundRect(
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
     *
     * rorEditor stuff
     *
     */

    addNewNode(position: { x: number; y: number; z: number }) {
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
            /*this.$bvToast.toast("Duplicate node detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });*/
            return;
        }

        const nodeId = this.getLastNodeId() + 1;

        this.nodesTruck.push({
            sbd_preset_id: -1,
            snd_preset_id: -1,
            grp_id: -1,
            comment_id: -1,

            id: nodeId.toString(),
            idEditor: nodeId,
            x: position.x / this.renderOptions.nodePosRenderScale,
            y: position.y / this.renderOptions.nodePosRenderScale,
            z: position.z / this.renderOptions.nodePosRenderScale
        });

        const historyData: HistorySystem = {
            fn: "addNode",
            data: "index:" + nodeId
        };

        this.HistorySystem.unshift(historyData);

        this.LoadTruckJson();
        this.requestAllRendersUpdate();
    }

    private getNodeByName(str: string): TRUCK.TruckFileNodes | undefined {
        let node: TRUCK.TruckFileNodes | undefined;

        this.nodesTruck.forEach(currNode => {
            if (currNode.idEditor == parseInt(str)) {
                node = currNode;
            }
        });

        if (node == undefined) return undefined;

        return node;
    }

    private getLastNodeId(): number {
        let i = -1;
        this.nodesTruck.forEach(nodeEl => {
            if (nodeEl.idEditor! > i) i = nodeEl.idEditor!;
        });

        return i;
    }

    private getLastBeamId(): number {
        let id = -1;
        this.beamsTruck.forEach(beamEl => {
            if (beamEl.id! > id) {
                id = beamEl.id!;
            }
        });

        return id;
    }

    public loadTruckFile() {
        this.truckFileData = store.getters.getTruckData;

        this.nodesTruck = this.truckFileData.nodes!;
        this.beamsTruck = this.truckFileData.beams!;

        //if (truckData.cameras) this.cameras = truckData.cameras!;

        //if (truckData.cineCam) this.cinecam = truckData.cineCam!;

        // if (truckData.wheels2) this.wheels2 = truckData.wheels2;

        this.LoadTruckJson();
        this.buildBeamsLines(true);
        this.requestAllRendersUpdate();
    }

    private geoBeamsArray: any = [];
    private nodesText: any[] = [];
    private wheelsMeshArray: THREE.LineSegments[] = [];
    private beamsLineMesh: any;

    private LoadTruckJson() {
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
            const currNode = this.nodesTruck[i];

            if (currNode.idEditor == undefined) {
                return;
            }

            const spriteMaterial = new THREE.SpriteMaterial({
                color: "green"
            });

            spriteMaterial.name = currNode.idEditor + "_mat";

            const idx = parseInt(currNode.id);
            this.nodeObject[idx] = new THREE.Sprite(spriteMaterial);
            this.nodeObject[idx].scale.set(
                this.nodeSpriteScale,
                this.nodeSpriteScale,
                1.0
            );

            this.nodeObject[idx].position.set(
                currNode.x * this.renderOptions.nodePosRenderScale,
                currNode.y * this.renderOptions.nodePosRenderScale,
                currNode.z * this.renderOptions.nodePosRenderScale
            );

            this.nodeObject[idx].name = currNode.idEditor.toString();

            this.scene!.add(this.nodeObject[idx]);
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
        this.rendersArray.forEach(render => {
            this.createDragNodes(render);
        });

        for (let i = 0; i < this.beamsTruck.length; i++) {
            const beamData = this.beamsTruck[i];

            const pt = [];

            //two nodes in a beam so we generate the nodes
            for (let index = 0; index < 2; index++) {
                let nodeKey: string = beamData.node1.toString();

                if (index == 1) {
                    nodeKey = beamData.node2.toString();
                }

                const currNode: TRUCK.TruckFileNodes = this.nodesTruck.filter(
                    el => el.idEditor == parseInt(nodeKey)
                )[0];

                //its already defined
                pt[index] = this.nodeObject.filter(
                    el => el.name == currNode.idEditor?.toString()
                )[0].position;
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
        this.updateWheels();

        /**
         *
         * Update UI stuff and everything else
         *
         */
        store.dispatch("setTruckNB", {
            nodes: this.nodesTruck,
            beams: this.beamsTruck
        });
    }

    public updateWheels() {
        this.wheelsMeshArray.forEach(element => {
            this.scene.remove(element);
        });
        /**
         * fetch wheels data
         */
        this.wheelWireFrame = [];
        if (store.getters.getTruckData.wheels2) {
            const wheelData: TRUCK.TruckFileWheels2[] =
                store.getters.getTruckData.wheels2;

            wheelData.forEach(wheel => {
                this.wheelWireFrame.push({
                    node1: wheel.node1,
                    node2: wheel.node2,
                    numRays: wheel.numRays,
                    tyreRadius: wheel.tyreRadius
                });
            });
        }
        if (store.getters.getTruckData.wheels) {
            const wheelData: TRUCK.TruckFileWheels[] =
                store.getters.getTruckData.wheels;

            wheelData.forEach(wheel => {
                this.wheelWireFrame.push({
                    node1: wheel.node1,
                    node2: wheel.node2,
                    numRays: wheel.numRays,
                    tyreRadius: wheel.radius
                });
            });
        }

        /**
         * get them ready to render
         */

        this.wheelWireFrame.forEach(wheel => {
            this.buildWheelCyl(
                this.getNodeByName(wheel.node1) as TRUCK.TruckFileNodes,
                this.getNodeByName(wheel.node2) as TRUCK.TruckFileNodes,
                wheel.numRays,
                wheel.tyreRadius
            );
        });
    }

    public toggleWheelsVisibility() {
        this.wheelsMeshArray.forEach(element => {
            element.visible = !element.visible;
        });

        this.requestAllRendersUpdate();
    }

    /**
     *
     * Some help from
     * https://stackoverflow.com/a/25769902/10382446
     *
     */
    private buildWheelCyl(
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

        const wireframe = new THREE.WireframeGeometry(geometry);

        const cylinder = new THREE.LineSegments(wireframe);

        cylinder.applyMatrix4(orientation);

        cylinder.position.x = (node2Pos.x + node1Pos.x) / 2;
        cylinder.position.y = (node2Pos.y + node1Pos.y) / 2;
        cylinder.position.z = (node2Pos.z + node1Pos.z) / 2;

        this.wheelsMeshArray.push(cylinder);
        this.scene.add(cylinder);
    }

    private createBeam(node1: THREE.Mesh, node2: THREE.Mesh) {
        if (node1.name == node2.name) {
            /* this.$bvToast.toast("Zero-length beam detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });*/
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
            /*this.$bvToast.toast("Duplicated beam detected", {
                title: `Info`,
                variant: "info",
                solid: true
                //noAutoHide: true
            });*/
            return;
        }

        const beamId = this.getLastBeamId() + 1;

        this.beamsTruck.push({
            sbd_preset_id: -1,
            snd_preset_id: -1,
            grp_id: -1,
            comment_id: -1,
            options: "v",

            node1: node1.name.toString(),
            node2: node2.name.toString(),
            id: beamId
        });

        const historyData: HistorySystem = {
            fn: "addBeam",
            data: "index:" + beamId
        };

        this.HistorySystem.unshift(historyData);

        this.LoadTruckJson();
        this.buildBeamsLines();
    }

    private buildBeamsLines(init = false) {
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

    private updateBeams(obj: {
        name: any;
        position: { x: number; y: number; z: number };
    }) {
        //node number

        if (obj == undefined) return;

        const node: any = this.nodesTruck.filter(
            node => node.idEditor == obj.name
        )[0];

        node.x = obj.position.x * (1 / this.renderOptions.nodePosRenderScale);
        node.y = obj.position.y * (1 / this.renderOptions.nodePosRenderScale);
        node.z = obj.position.z * (1 / this.renderOptions.nodePosRenderScale);

        this.buildBeamsLines();
        this.requestAllRendersUpdate();
    }
    /**
     *
     *
     *
     */
    private tempBeamLine?: THREE.Line = undefined;
    private lastSelectedNode?: THREE.Mesh = undefined;
    private hoverNode?: THREE.Mesh = undefined;
    private selectedNode?: THREE.Mesh = undefined;
    private isNodeDrag = false;

    private createDragNodes(render: RenderInterface) {
        // if (render.type == "full") return;
        if (this.dragControl == undefined) {
            return;
        }

        if (this.dragControl[render.id] != undefined) {
            this.dragControl[render.id].removeEventListener("hoveron", e =>
                this.hoverOn(e)
            );
            this.dragControl[render.id].removeEventListener("hoveroff", e =>
                this.hoverOff(e)
            );
            this.dragControl[render.id].removeEventListener("dragstart", e =>
                this.dragStart(e)
            );
            /*this.dragControl[render.id].removeEventListener(
                "drag",
                this.onDrag
            );*/
            this.dragControl[render.id].removeEventListener("dragend", e =>
                this.dragEnd(e)
            );
            this.dragControl[render.id].dispose();
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

        this.dragControl[render.id].addEventListener("hoveron", e =>
            this.hoverOn(e)
        );
        this.dragControl[render.id].addEventListener("hoveroff", e =>
            this.hoverOff(e)
        );
        this.dragControl[render.id].addEventListener("dragstart", e =>
            this.dragStart(e)
        );
        this.dragControl[render.id].addEventListener("dragend", e =>
            this.dragEnd(e)
        );
    }

    private hoverOn(event: any) {
        event.object.material.color.g = 0;
        event.object.material.color.r = 1;
        event.object.material.color.b = 0;

        this.hoverNode = event.object;

        if (this.selectedNode && this.isKeyComb.isShiftKey && this.hoverNode) {
            if (this.hoverNode.name == this.selectedNode.name) return;

            //TODO Duplicate code here
            if (this.tempBeamLine) {
                this.scene.remove(this.tempBeamLine);
                //this.tempBeamLine = undefined;
                this.requestAllRendersUpdate();
            }

            //TODO maybe memeory leak here
            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            const points = [];
            points.push(this.selectedNode.position);
            points.push(this.hoverNode.position);

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.tempBeamLine = new THREE.Line(geometry, material);
            this.scene.add(this.tempBeamLine);

            this.requestAllRendersUpdate();
        }
    }

    private hoverOff(event: any) {
        event.object.material.color.g = 0.5;
        event.object.material.color.r = 0;
        event.object.material.color.b = 0;

        this.hoverNode = undefined;

        if (this.tempBeamLine) {
            this.scene.remove(this.tempBeamLine);
            //this.tempBeamLine = undefined;
            this.requestAllRendersUpdate();
        }
    }

    private dragStart(event: any) {
        // if (event.object.type == "Sprite") return;

        if (this.currActiveRenderId == 3 && !this.isKeyComb.isShiftKey) {
            this.rendersArray[3].controls!.enabled = false;
        }

        event.object.material.color.g = 1;
        event.object.material.color.b = 0;
        event.object.material.color.r = 0;

        this.selectedNode = event.object;

        if (this.lastSelectedNode && this.selectedNode) {
            if (this.isKeyComb.isShiftKey) {
                this.createBeam(this.lastSelectedNode, this.selectedNode);
                this.selectedNode = undefined;
                this.lastSelectedNode = undefined;
            }
        }

        if (this.selectedNode && this.selectedNode.name) {
            if (this.isKeyComb.isShiftKey) return;

            const ourNode = this.nodesTruck.filter(
                el => el.idEditor == parseInt(this.selectedNode!.name)
            )[0];

            console.log(this.selectedNode?.name);

            const hist: HistorySystem = {
                fn: "moveNode",
                data:
                    ourNode.idEditor +
                    "|" +
                    ourNode.x +
                    "|" +
                    ourNode.y +
                    "|" +
                    ourNode.z
            };

            this.HistorySystem.unshift(hist);
            console.log(this.HistorySystem);
        }

        this.isNodeDrag = true;
    }

    private dragEnd(event: any) {
        //if (event.object.type == "Sprite") return;
        if (this.currActiveRenderId == 3) {
            this.rendersArray[3].controls!.enabled = true;
        }

        event.object.material.color.g = 0.5;
        event.object.material.color.b = 0;
        event.object.material.color.r = 0;

        if (this.isKeyComb.isShiftKey) {
            this.lastSelectedNode = this.selectedNode;
        } else {
            this.lastSelectedNode = undefined;
        }

        //this.selectedNode = undefined;

        this.isNodeDrag = false;

        this.updateBeams(event.object);

        /*store.dispatch("setTruckNB", {
            nodes: this.nodesTruck,
            beams: this.beamsTruck
        });*/
    }

    /**
     *
     * Ogre Mesh Loader
     *
     */

    public loadMeshWireframe(MeshXMLFile: File) {
        this.ogreLoader = new OgreLoader(
            MeshXMLFile,
            this.scene,
            this.renderOptions.nodePosRenderScale,
            this
        );
    }

    public removeMeshWireframe() {
        this.ogreLoader.remove();
    }

    public toggleMeshWireframe() {
        if (this.ogreLoader) {
            this.ogreLoader.toggleVisibility();
        }
    }

    /**
     *
     * Blueprint stuff
     *
     */
    private BluePrintControls: DragControls[] = [];
    private bluePrintArray: any[] = [];

    public async loadBluePrints(bluePrintFile: File) {
        const dataURI = fs.readFileSync(bluePrintFile.path, "base64");

        const imgData = `data:${bluePrintFile.type};base64,` + dataURI;

        const texture = new THREE.TextureLoader().load(imgData);
        texture.anisotropy = 16;

        const dimensions: {
            w: number;
            h: number;
        } = await this.getImageDimensions(imgData);

        const bluePrintPlanes: any = [];

        this.rendersArray.forEach(render => {
            if (render.type == "full") return;

            const material = new THREE.MeshBasicMaterial({
                map: texture
            });
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

        this.rendersArray.forEach(render => {
            if (render.type == "full") return;

            this.BluePrintControls[render.id] = new DragControls(
                this.bluePrintArray,
                //TODO why did i not use render instead of rendersArray??
                this.rendersArray[render.id].cameraOrtho as THREE.Camera,
                this.rendersArray[render.id].worker?.domElement
            );

            this.BluePrintControls[render.id].enabled = false;
        });
    }

    public removeBluePrints() {
        this.bluePrintArray.forEach(bluPrt => {
            this.scene.remove(bluPrt);
        });
        this.bluePrintArray = [];
        this.BluePrintControls.forEach(element => {
            element.deactivate();
            element.dispose();
        });

        this.requestAllRendersUpdate();
    }

    public toggleBlueprint() {
        this.bluePrintArray.forEach(bluPrt => {
            bluPrt.visible = !bluPrt.visible;
        });
        this.requestAllRendersUpdate();
    }

    private getImageDimensions(file: string): { w: number; h: number } | any {
        return new Promise(function(resolved, rejected) {
            const i = new Image();
            i.onload = function() {
                resolved({ w: i.width, h: i.height });
            };
            i.src = file;
        });
    }

    public resetPrespCamera() {
        this.rendersArray[3].cameraPersp!.position.set(-300, 200, 200);
        this.rendersArray[3].cameraPersp!.lookAt(0, 0, 0);
    }

    public toggleNodesNames() {
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

    public setGridFactor(f: number) {
        this.gridFactor = f;

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

    public setNodeSizeFactor(f: number) {
        this.nodeSpriteScale = f * 4;
        this.LoadTruckJson();
        this.requestAllRendersUpdate();
    }

    /**
     * Undo/Redo
     * Only for nodes and beams
     *
     * addNode
     * removeNode
     * moveNode
     *
     * addBeam
     * removeBeam
     */
    public requestUndo() {
        console.log(this.HistorySystem);

        if (this.HistorySystem.length == 0) return;

        const data: HistorySystem = this.HistorySystem[0];

        switch (data.fn) {
            case "addNode":
                console.log("removing node:" + data.data);
                this.deleteNodeById(data.data.split(":")[1]);
                this.HistorySystem.shift();
                break;
            case "addBeam":
                console.log("removing beam:" + data.data);
                this.deleteBeamById(data.data.split(":")[1]);
                this.HistorySystem.shift();
                break;
            case "moveNode":
                console.log("restored node to pos");

                this.updateBeams({
                    name: data.data.split("|")[0],
                    position: {
                        x:
                            parseFloat(data.data.split("|")[1]) *
                            this.renderOptions.nodePosRenderScale,
                        y:
                            parseFloat(data.data.split("|")[2]) *
                            this.renderOptions.nodePosRenderScale,
                        z:
                            parseFloat(data.data.split("|")[3]) *
                            this.renderOptions.nodePosRenderScale
                    }
                });
                this.HistorySystem.shift();
                break;
        }
    }

    public refresh() {
        this.truckFileData = store.getters.getTruckData;

        this.nodesTruck = this.truckFileData.nodes!;
        this.beamsTruck = this.truckFileData.beams!;

        this.LoadTruckJson();
        this.buildBeamsLines();
        this.requestAllRendersUpdate();
    }

    public requestSave() {
        const truckParser = new Parser.default();
        let filePath: string | undefined = store.getters.getTruckFilePath;

        if (filePath == "") {
            filePath = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
                defaultPath: "newTruck",
                filters: [
                    {
                        name: "Truck file",
                        extensions: [
                            "truck",
                            "car",
                            "airplane",
                            "load",
                            "boat",
                            "train",
                            "machine",
                            "trailer",
                            "fixed"
                        ]
                    }
                ]
            });
            store.dispatch("setTruckFilePath", filePath);
        }

        if (filePath == undefined) {
            return;
        }

        truckParser.saveFile(filePath);
    }

    public renameGrp(grp_id: number, grpTitle: string) {
        if (this.truckFileData.groups) {
            this.truckFileData.groups.filter(
                el => el.grp_id == grp_id
            )[0].title = grpTitle;
        }
        store.dispatch("setTruckData", this.truckFileData);
    }

    public addGr_node(nodeId: number, title: string) {
        console.log("addGrp_node");

        if (this.truckFileData.groups == undefined) {
            this.truckFileData.groups = [];
        }

        /**
         * we check that there is actually no group assigned to the node and all nodes after it
         * or it is assigned to the last group available
         */
        const currNode = this.nodesTruck.filter(el => el.idEditor == nodeId)[0];
        const grpLength = this.truckFileData.groups.length;

        if (currNode.grp_id == grpLength - 1) {
            this.truckFileData.groups.push({
                grp_id: grpLength,
                title: title
            });

            /** from now on grpLength is the new grp_id */

            this.nodesTruck.forEach(el => {
                if (el.idEditor >= nodeId) {
                    el.grp_id = grpLength;
                }
            });
        } else {
            const ex_grp_id = JSON.parse(JSON.stringify(currNode.grp_id));

            this.truckFileData.groups.push({
                grp_id: grpLength,
                title: title
            });

            this.nodesTruck.forEach(el => {
                if (el.idEditor >= nodeId) {
                    console.log(ex_grp_id);
                    if (el.grp_id == ex_grp_id) {
                        el.grp_id = grpLength;
                    }
                }
            });
        }

        console.log(this.truckFileData);
        store.dispatch("setTruckData", this.truckFileData);
    }

    public addGrp_beam(beamId: number, title: string) {
        console.log("addGrp_beam");

        if (this.truckFileData.groups == undefined) {
            this.truckFileData.groups = [];
        }

        /**
         * we check that there is actually no group assigned to the node and all nodes after it
         * or it is assigned to the last group available
         */
        const currBeam = this.beamsTruck.filter(el => el.id == beamId)[0];
        const grpLength = this.truckFileData.groups.length;

        if (currBeam.grp_id == grpLength - 1) {
            this.truckFileData.groups.push({
                grp_id: grpLength,
                title: title
            });

            /** from now on grpLength is the new grp_id */

            this.beamsTruck.forEach(el => {
                if (el.id >= beamId) {
                    el.grp_id = grpLength;
                }
            });
        } else {
            const ex_grp_id = JSON.parse(JSON.stringify(currBeam.grp_id));

            this.truckFileData.groups.push({
                grp_id: grpLength,
                title: title
            });

            this.beamsTruck.forEach(el => {
                if (el.id >= beamId) {
                    console.log(ex_grp_id);
                    if (el.grp_id == ex_grp_id) {
                        el.grp_id = grpLength;
                    }
                }
            });
        }
        console.log(this.truckFileData);
        store.dispatch("setTruckData", this.truckFileData);
    }
}
