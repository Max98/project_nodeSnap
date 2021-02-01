import * as THREE from "three";
import { EditorNode } from "../TruckFileInterfaces";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DragControls } from "../../js/DragControls.js";
import TruckEditorManager from "../TruckEditorManagaer";
import { rendererViewType } from "../TruckEditorInterfaces";
import { ConeBufferGeometry, Vector3 } from "three";
import BlueprintPlugin from "./Plugins/blueprint";
import BluemodelPlugin from "./Plugins/bluemodel";
import { useToast } from "vue-toastification";
import Config from "./Plugins/config";
import * as Logger from "electron-log";

const remote = require("electron").remote;
const { Menu, MenuItem, dialog } = remote;

/**
 * Simplified here, we don't need more
 */
interface EditorBeam {
    node1: number;
    node2: number;
}

enum ControlMode {
    TRUCK,
    BLUEPRINT
}

export default class SceneController {
    private scene: THREE.Scene;

    private nodesSpriteArray: THREE.Sprite[] = [];
    private displayNodesName = false;
    private nodesDragControl: DragControls[] = [];
    private isNodeMove = false;

    private invisibleNodesArray: number[] = [];
    private beamsArray: EditorBeam[] = [];
    private beamLinesMesh: THREE.LineSegments | undefined;
    //optim
    private linePoints: Vector3[] = [];
    private lineIdx: number[] = [];

    private editorScene: THREE.Object3D;

    private mouse: THREE.Vector2 = new THREE.Vector2(0, 0);

    private snapEnable = false;
    private snapScale = 60; //TODO: This is = gridSize/gridDivision from TruckEditorRenderer.ts
    private snapScaleFactor = 1;

    private makeBeam = false;
    private makeBeamPt: number[] = [];
    private tempBeamLine: THREE.Line | undefined;

    /**
     * Default values
     */
    private nodesSpriteScale = 4;
    private nodesPosRenderScale = 60;

    /**
     * Editor mode
     */
    private controlMode: ControlMode = ControlMode.TRUCK;
    private blueprintSystem: BlueprintPlugin;
    private bluemodelSystem: BluemodelPlugin;

    /**
     * Config system
     */
    private projectConfig: Config;

    /**
     * logger
     */
    private logger: Logger.LogFunctions;

    constructor(scene: THREE.Scene) {
        this.logger = Logger.default.scope("sceneController");
        this.logger.log("init");

        this.scene = scene;

        this.editorScene = new THREE.Object3D();

        this.blueprintSystem = new BlueprintPlugin(this.scene);
        this.bluemodelSystem = new BluemodelPlugin(this.scene);

        this.projectConfig = new Config();
    }

    public dispose() {
        this.reset();
        this.logger.log("Dispose");
    }

    /** Main editor functions */

    /**
     * Resets the editor scene
     */
    public reset() {
        this.nodesSpriteArray.forEach(el => {
            this.editorScene.remove(el);
        });

        if (this.beamLinesMesh) this.editorScene.remove(this.beamLinesMesh);

        this.nodesSpriteArray = [];
        this.invisibleNodesArray = [];

        this.nodesDragControl.forEach(el => {
            el.dispose();
        });
        this.nodesDragControl = [];

        this.beamsArray = [];
    }

    /**
     * Addes a node to the 3D Scene
     * @param nodeData node data
     */
    public addNodeToScene(nodeData: EditorNode) {
        const spriteMaterial = new THREE.SpriteMaterial({
            color: "green"
        });

        this.nodesSpriteArray[nodeData.id] = new THREE.Sprite(spriteMaterial);
        this.nodesSpriteArray[nodeData.id].scale.set(
            this.nodesSpriteScale,
            this.nodesSpriteScale,
            1.0
        );

        this.nodesSpriteArray[nodeData.id].position.set(
            nodeData.x * this.nodesPosRenderScale,
            nodeData.y * this.nodesPosRenderScale,
            nodeData.z * this.nodesPosRenderScale
        );

        this.nodesSpriteArray[nodeData.id].userData = {
            id: nodeData.id,
            grp_id: nodeData.grp_id
        };

        this.nodesSpriteArray[nodeData.id].layers.set(1);

        //Generate node name
        //TODO: support nodes2
        const spritey = this.makeTextSprite(nodeData.id.toString());

        if (spritey) {
            spritey.visible = this.displayNodesName;
            this.nodesSpriteArray[nodeData.id].add(spritey);
            spritey.layers.set(0);
        }

        this.nodesDragControl.forEach(el => {
            const obj = el.getObjects();
            obj.push(this.nodesSpriteArray[nodeData.id]);
        });

        this.nodesSpriteArray[nodeData.id].visible = nodeData.isVisible;
        if (!nodeData.isVisible) this.invisibleNodesArray.push(nodeData.id);

        this.editorScene.add(this.nodesSpriteArray[nodeData.id]);
    }

    /**
     * Adds a beam to the 3D scene
     * @param node1
     * @param node2
     */
    public addBeamToScene(node1: number, node2: number) {
        this.beamsArray.push({ node1, node2 });
    }

    /**
     * Remove a specific beam from the 3D Scene
     * this prevents reloading everything
     * @param node1
     * @param node2
     */
    public removeBeamFromScene(node1: number, node2: number) {
        const currBeam = this.beamsArray.find(
            el => el.node1 == node1 && el.node2 == node2
        );

        this.beamsArray = this.beamsArray.filter(el => el != currBeam);
    }

    /**
     * UI functions
     */

    /**
     * performs calc before sending a request to move the node
     * @param id nodeId
     * @param position new position
     */
    private moveNode(
        id: number,
        position: { x: number; y: number; z: number }
    ) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .moveNode(id, {
                x: position.x / this.nodesPosRenderScale,
                y: position.y / this.nodesPosRenderScale,
                z: position.z / this.nodesPosRenderScale
            });
    }

    /**
     *
     */
    public moveNodeSprite(
        id: number,
        position: { x: number; y: number; z: number }
    ) {
        const sprite = this.nodesSpriteArray.find(el => el.userData.id == id);

        if (sprite != undefined) {
            sprite.position.x = position.x * this.nodesPosRenderScale;
            sprite.position.y = position.y * this.nodesPosRenderScale;
            sprite.position.z = position.z * this.nodesPosRenderScale;
        }
    }

    /**
     * add a new node
     * @param position new node pos
     */
    private addNode(position: THREE.Vector3) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .addNode(position.multiplyScalar(1 / this.nodesPosRenderScale));
    }

    /**
     * add a new beam
     */
    private addBeam(beam: { node1: number; node2: number }) {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .addBeam(beam);
    }

    /**
     * Prepares nodes in the scene for the editor
     */
    public prepareNodes() {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getViews()
            .forEach(el => {
                const dragControl = new DragControls(
                    [...this.nodesSpriteArray],
                    el.getCamera(),
                    el.getCanvas()
                );
                this.nodesDragControl.push(dragControl);

                dragControl.addEventListener("hoveron", e =>
                    this.onNodeDragHoverOn(e)
                );
                dragControl.addEventListener("hoveroff", e =>
                    this.onNodeDragHoverOff(e)
                );
                dragControl.addEventListener("drag", e =>
                    this.onNodeDragMove(e)
                );
                dragControl.addEventListener("dragstart", e =>
                    this.onNodeDragStart(e)
                );
                dragControl.addEventListener("dragend", e =>
                    this.onNodeDragEnd(e)
                );

                dragControl.mouseButton = 0; //Only mouse button 0 drags nodes (Left click)
                dragControl.view = el.getType();

                /**
                 * We do not want to drag nodes on the main view
                 */
                if (el.getType() == rendererViewType.VIEW_MAIN)
                    dragControl.enabled = false;
            });
    }

    /**
     * Builds the beam lines
     */
    public buildBeamLines() {
        if (this.beamLinesMesh != undefined) {
            this.editorScene.remove(this.beamLinesMesh);
        }

        this.lineIdx.length = 0;
        this.linePoints.length = 0;

        this.nodesSpriteArray.forEach(el => {
            this.linePoints.push(el.position);
        });

        this.beamsArray.forEach(currBeam => {
            const inv = this.invisibleNodesArray.find(
                el => el == currBeam.node1 || el == currBeam.node2
            );

            if (inv != undefined) return;

            this.lineIdx.push(currBeam.node1);
            this.lineIdx.push(currBeam.node2);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(
            this.linePoints
        );
        geometry.setIndex(this.lineIdx);

        const lineMaterial = new THREE.LineBasicMaterial({
            color: "#7e543e"
        });

        this.beamLinesMesh = new THREE.LineSegments(geometry, lineMaterial);
        this.beamLinesMesh.name = "beamLines";
        this.editorScene.add(this.beamLinesMesh);
    }

    /**
     * post node and beams scene population
     */
    public postCalc() {
        this.scene.add(this.editorScene);
    }

    /**
     * Scales nodes sprites
     * @param scaleFactor
     */
    public scaleNodeSprites(scaleFactor: number) {
        this.nodesSpriteScale = scaleFactor * 4;
        for (let i = 0, n = this.nodesSpriteArray.length; i < n; i++) {
            const currSprite = this.nodesSpriteArray[i];

            currSprite.scale.set(
                this.nodesSpriteScale,
                this.nodesSpriteScale,
                1.0
            );
        }
    }

    /**
     * sets nodes names visibility
     * @param state
     */
    public setNodesNameVisibility(state: boolean) {
        this.displayNodesName = state;

        for (let i = 0, n = this.nodesSpriteArray.length; i < n; i++) {
            const currNode = this.nodesSpriteArray[i];

            //the first children is the nameSprite
            currNode.children[0].visible = this.displayNodesName;
        }
    }

    /**
     * sets a node visibility
     * @param id nodeId
     * @param state
     */
    public setNodeVisibility(id: number, state: boolean) {
        const currNode = this.nodesSpriteArray.filter(
            el => el.userData.id == id
        )[0];

        currNode.visible = state;

        if (!state) {
            this.invisibleNodesArray.push(currNode.userData.id);

            this.nodesDragControl.forEach(el => {
                let obj = el.getObjects();
                obj = obj.filter(el => el != currNode);
            });
        } else {
            this.invisibleNodesArray = this.invisibleNodesArray.filter(
                el => el != currNode.userData.id
            );

            this.nodesDragControl.forEach(el => {
                const obj = el.getObjects();
                obj.push(currNode);
            });
        }

        this.buildBeamLines();
    }

    /**
     * Update sprite data
     * @param id nodeId
     * @param grpId grpId
     */
    public updateNodeSpriteGrp(id: number, grpId: number) {
        this.nodesSpriteArray.find(
            el => el.userData.id == id
        )!.userData.grp_id = grpId;
    }

    /**
     * sets a group's visibility
     * @param id groupId
     * @param state
     */
    public setGroupVisibility(id: number, state: boolean) {
        const nodesArray = this.nodesSpriteArray.filter(
            el => el.userData.grp_id == id
        );

        nodesArray.forEach(currNode => {
            currNode.visible = state;

            if (!state) this.invisibleNodesArray.push(currNode.userData.id);
            else {
                this.invisibleNodesArray = this.invisibleNodesArray.filter(
                    el => el != currNode.userData.id
                );
            }
        });

        this.buildBeamLines();
    }

    /**
     * Set snap factor
     * @param factor factor
     */
    public setSnapFactor(factor: number) {
        this.snapScaleFactor = factor;
    }

    /**
     * Snaps node to te grid
     * @param view view curretly used
     * @param posOriginal node position
     */
    private snapToGrid(
        view: rendererViewType,
        posOriginal: THREE.Vector3
    ): Vector3 {
        const pos: Vector3 = posOriginal.copy(posOriginal);

        switch (view) {
            case rendererViewType.VIEW_TOP:
                pos.x = Math.trunc(
                    Math.round(
                        pos.x / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.y = Math.trunc(
                    Math.round(
                        pos.y / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.z = Math.trunc(Math.round(pos.z));
                break;

            case rendererViewType.VIEW_SIDE:
                pos.z = Math.trunc(
                    Math.round(
                        pos.z / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.y = Math.trunc(
                    Math.round(
                        pos.y / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.x = Math.trunc(Math.round(pos.x));
                break;

            case rendererViewType.VIEW_FRONT:
                pos.z = Math.trunc(
                    Math.round(
                        pos.z / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.x = Math.trunc(
                    Math.round(
                        pos.x / (this.snapScale * this.snapScaleFactor)
                    ) *
                        this.snapScale *
                        this.snapScaleFactor
                );

                pos.y = Math.trunc(Math.round(pos.y));
                break;

            default:
                break;
        }

        return pos;
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
        context.textAlign = "left";

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
        sprite.scale.set(25, 12.5, 1.0);
        sprite.center.set(0.2, 0.95);

        //this.nodesText.push(sprite);

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
     * Mouse Events
     */

    private onNodeDragHoverOn(event: any) {
        const currObj = event.object;

        currObj.material.color.g = 0;
        currObj.material.color.r = 1;
        currObj.material.color.b = 0;

        if (this.makeBeamPt.length == 1) {
            if (this.tempBeamLine != undefined) {
                this.scene.remove(this.tempBeamLine);
            }

            const firstNode = this.nodesSpriteArray.find(
                el => el.userData.id == this.makeBeamPt[0]
            );
            if (firstNode == undefined) {
                return;
            }

            const material = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });

            const points = [];
            points.push(firstNode.position);
            points.push(currObj.position);

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            this.tempBeamLine = new THREE.Line(geometry, material);
            this.scene.add(this.tempBeamLine);
        } else {
            if (this.tempBeamLine != undefined) {
                this.scene.remove(this.tempBeamLine);
            }
        }
    }

    private onNodeDragHoverOff(event: any) {
        const currObj = event.object;

        currObj.material.color.g = 0.5;
        currObj.material.color.r = 0;
        currObj.material.color.b = 0;

        if (this.tempBeamLine != undefined) {
            this.scene.remove(this.tempBeamLine);
        }
    }

    private onNodeDragStart(event: any) {
        if (event.object) {
            const currObj = event.object as THREE.Object3D;
            if (this.makeBeam) {
                if (this.makeBeamPt.length >= 2) {
                    this.makeBeamPt = [];
                }
                this.makeBeamPt.push(currObj.userData.id);
            }
        }
    }

    private onNodeDragEnd(event: any) {
        //if (event.button != 0) return;

        if (event.object && this.isNodeMove) {
            this.isNodeMove = false;
            const currObj = event.object as THREE.Object3D;
            this.moveNode(currObj.userData.id, {
                x: currObj.position.x,
                y: currObj.position.y,
                z: currObj.position.z
            });
        }
    }

    private onNodeDragMove(event: any) {
        /**
         * If we actually moved the node, we proceed to calc
         */
        this.isNodeMove = true;

        /**
         * disable making beams if we detect movment
         */
        this.makeBeam = false;
        this.makeBeamPt = [];

        /**
         * TODO: implement option snap 2D <=> 3D
         */
        const obj: THREE.Object3D = event.object;
        const view: rendererViewType = event.target.view;

        if (this.snapEnable) {
            obj.position.copy(this.snapToGrid(view, obj.position));
        }
    }

    public onMouseDown(event: MouseEvent, camera: THREE.Camera) {
        if (this.controlMode != ControlMode.TRUCK) return;

        this.nodesDragControl.forEach(el => {
            el.activate();
        });
    }

    public onMouseUp(event: any, camera: THREE.Camera) {
        if (this.controlMode != ControlMode.TRUCK) return;

        if (event.button == 2) {
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(this.mouse, camera);
            //We need only the nodes layer
            raycaster.layers.set(1);

            const intersects = raycaster.intersectObjects(
                this.nodesSpriteArray
            );

            if (intersects.length > 0) {
                //Deactivate the drag nodes system to prevent bugs
                this.nodesDragControl.forEach(el => {
                    el.deactivate();
                });

                const menu = new Menu();
                menu.append(
                    new MenuItem({
                        label: "Delete node",
                        click: () => {
                            TruckEditorManager.getInstance()
                                .getEditorObj()
                                .removeNode(intersects[0].object.userData.id);
                        }
                    })
                );
                menu.popup({
                    window: remote.getCurrentWindow()
                });
            }
        }
    }

    public onMouseMove(event: any) {
        const canvasBounds = event.target.getBoundingClientRect();
        this.mouse.x =
            ((event.clientX - canvasBounds.left) /
                (canvasBounds.right - canvasBounds.left)) *
                2 -
            1;
        this.mouse.y =
            -(
                (event.clientY - canvasBounds.top) /
                (canvasBounds.bottom - canvasBounds.top)
            ) *
                2 +
            1;
    }

    public onMouseDblClick(
        event: any,
        camera: THREE.Camera,
        view: rendererViewType
    ) {
        if (this.controlMode != ControlMode.TRUCK) return;
        if (
            view ==
            (rendererViewType.VIEW_MAIN || rendererViewType.VIEW_DEFAULT)
        )
            return;

        //Project mouse to 3D scene
        const mousePos = new THREE.Vector3();
        mousePos.set(this.mouse.x, this.mouse.y, 0);
        mousePos.unproject(camera);

        let nodePos = new THREE.Vector3();

        switch (view) {
            case rendererViewType.VIEW_TOP:
                nodePos.set(mousePos.x, mousePos.y, 0);
                break;

            case rendererViewType.VIEW_SIDE:
                nodePos.set(0, mousePos.y, mousePos.z);
                break;

            case rendererViewType.VIEW_FRONT:
                nodePos.set(mousePos.x, 0, mousePos.z);
                break;

            default:
                break;
        }

        if (this.snapEnable) nodePos = this.snapToGrid(view, nodePos);

        this.addNode(nodePos);
    }

    /**
     * Keyboard Events
     * TODO: Maybe input manager?
     */

    public onKeyDown(e: KeyboardEvent) {
        if (e.shiftKey) {
            const mainView = TruckEditorManager.getInstance()
                .getRendererObj()
                .getViews()
                .find(el => el.getType() == rendererViewType.VIEW_MAIN);
            if (mainView != undefined) {
                mainView.getCameraControl().enableRotate = false;
            }

            this.nodesDragControl.forEach(el => {
                el.enabled = false;
            });
        }

        switch (e.key) {
            case "Z":
            case "z":
                if (e.ctrlKey) {
                    if (this.controlMode == ControlMode.TRUCK) {
                        TruckEditorManager.getInstance()
                            .getEditorObj()
                            .requestUndo();
                    }
                }
                break;

            case "B":
            case "b":
                if (e.ctrlKey) {
                    this.switchEditorMode(ControlMode.BLUEPRINT);
                    useToast().info("Switching to blueprint edit");
                }
                break;

            case "N":
            case "n":
                if (e.ctrlKey) {
                    this.switchEditorMode(ControlMode.TRUCK);
                    useToast().info("Switching to truck edit");
                }
                break;

            default:
                if (this.controlMode == ControlMode.TRUCK) {
                    if (e.ctrlKey) {
                        this.snapEnable = true;
                    }
                    if (e.shiftKey) {
                        this.makeBeam = true;

                        if (this.makeBeamPt.length > 1) {
                            this.addBeam({
                                node1: this.makeBeamPt[0],
                                node2: this.makeBeamPt[1]
                            });
                            this.makeBeamPt = [];
                        }
                    }
                }
                break;
        }
    }

    public onKeyUp(e: KeyboardEvent) {
        const mainView = TruckEditorManager.getInstance()
            .getRendererObj()
            .getViews()
            .find(el => el.getType() == rendererViewType.VIEW_MAIN);
        if (mainView != undefined) {
            mainView.getCameraControl().enableRotate = true;
        }

        this.nodesDragControl.forEach(el => {
            el.enabled = true;
        });

        switch (e.key) {
            default:
                if (this.controlMode == ControlMode.TRUCK) {
                    this.snapEnable = false;
                    this.makeBeam = false;
                }

                break;
        }
    }

    public getBlueprintSystem() {
        return this.blueprintSystem;
    }

    public getBluemodelSystem() {
        return this.bluemodelSystem;
    }

    /**
     * Editor modes
     */
    public switchEditorMode(control: ControlMode) {
        this.controlMode = control;

        if (control != ControlMode.TRUCK) {
            this.nodesDragControl.forEach(el => {
                el.enabled = false;
            });
        } else {
            this.nodesDragControl.forEach(el => {
                el.enabled = true;
            });
        }

        if (control != ControlMode.BLUEPRINT) {
            this.blueprintSystem.setControlState(false);
            this.bluemodelSystem.setControlState(false);
        } else {
            this.blueprintSystem.setControlState(true);
            this.bluemodelSystem.setControlState(true);
        }
    }

    /**
     * Load user preference for this specific project
     */
    public loadConfig(filePath: string) {
        this.projectConfig.loadConfig(filePath);
    }

    public saveConfig(filePath: string) {
        this.projectConfig.saveConfig(filePath);
    }
}
