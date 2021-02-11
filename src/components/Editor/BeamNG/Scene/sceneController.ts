import * as THREE from "three";
import { DragControls } from "../../../js/DragControls.js";
import TruckEditorManager from "../../TruckEditorManagaer";
import { EditorSlot, rendererViewType } from "../../TruckEditorInterfaces";
import { Scene, Vector3 } from "three";

import { useToast } from "vue-toastification";

import * as Logger from "electron-log";
import SceneController, {
    SceneBeam,
    SceneNode,
    SceneSlot
} from "../../Common/SceneController";

const remote = require("electron").remote;
const { Menu, MenuItem, dialog } = remote;

enum ControlMode {
    TRUCK,
    BLUEPRINT
}

export default class BeamNGSceneController extends SceneController {
    private sceneSlot: SceneSlot[] = [];

    private displayNodesName = false;
    private nodesDragControl: DragControls[] = [];
    private isNodeMove = false;

    private invisibleNodesArray: {
        id: number;
        slotId: number;
    }[] = [];
    //optim

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

    /**
     * logger
     */
    private logger: Logger.LogFunctions;

    constructor(scene: THREE.Scene) {
        super(scene);

        this.logger = Logger.default.scope("sceneController");
        this.logger.log("init");
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
        throw console.error("Not implemented");
    }

    /**
     * Addes a node to the 3D Scene
     * @param nodeData node data
     */
    public addNodeToScene(nodeData: SceneNode, slotData?: EditorSlot) {
        //well 0 = false, so undefined suits here
        if (!slotData) return;

        let currSlot = this.getSlotById(slotData.id);

        if (!currSlot) {
            const id = this.sceneSlot.push({
                id: slotData.id,
                title: slotData.name,
                nodes: [],
                beams: [],
                scene: new THREE.Scene(),
                visible: slotData.isVisible
            });
            currSlot = this.sceneSlot[id - 1];
        }
        if (!currSlot.scene) return;

        const spriteMaterial = new THREE.SpriteMaterial({
            color: "green"
        });
        const newNode = new THREE.Sprite(spriteMaterial);

        newNode.scale.set(this.nodesSpriteScale, this.nodesSpriteScale, 1.0);

        newNode.position
            .copy(nodeData.position)
            .multiplyScalar(this.nodesPosRenderScale);

        newNode.userData = {
            id: nodeData.nodeInfo.nodeId,
            name: nodeData.nodeInfo.nodeName,
            grp_id: nodeData.nodeInfo.grpId,
            slot: slotData.name
        };

        newNode.layers.set(1);

        //Generate node name
        const spritey = this.makeTextSprite(
            nodeData.nodeInfo.nodeName.toString()
        );

        if (spritey) {
            spritey.visible = this.displayNodesName;
            newNode.add(spritey);
            spritey.layers.set(0);
        }

        this.nodesDragControl.forEach(el => {
            const obj = el.getObjects();
            obj.push(newNode);
        });

        newNode.visible = nodeData.visible;

        if (!nodeData.visible)
            this.invisibleNodesArray.push({
                id: nodeData.nodeInfo.nodeId,
                slotId: currSlot.id
            });

        currSlot.nodes.push(newNode);
        currSlot.scene.add(newNode);
    }

    private getSlotById(id: number): SceneSlot | undefined {
        return this.sceneSlot.find(el => el.id == id);
    }

    /**
     * Adds a beam to the 3D scene
     * @param node1
     * @param node2
     */
    public addBeamToScene(beam: SceneBeam, slotId?: number) {
        if (slotId == undefined) return;
        const currSlot = this.getSlotById(slotId);
        if (!currSlot) return;

        currSlot.beams.push(beam);
    }

    /**
     * Remove a specific beam from the 3D Scene
     * this prevents reloading everything
     * @param node1
     * @param node2
     */
    public removeBeamFromScene(node1: number, node2: number) {
        throw console.error("Not implemented");
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
        throw console.error("Not implemented");
    }

    /**
     *
     */
    public moveNodeSprite(
        id: number,
        position: { x: number; y: number; z: number }
    ) {
        throw console.error("Not implemented");
    }

    /**
     * add a new node
     * @param position new node pos
     */
    private addNode(position: THREE.Vector3) {
        TruckEditorManager.getInstance()
            .getEditorObj()!
            .addNode(position.multiplyScalar(1 / this.nodesPosRenderScale));
    }

    /**
     * add a new beam
     */
    private addBeam(beam: { node1: number; node2: number }) {
        TruckEditorManager.getInstance()
            .getEditorObj()!
            .addBeam(beam);
    }

    /**
     * Prepares nodes in the scene for the editor
     */
    public prepareNodes() {
        console.warn("Not implemented");
    }

    private builSlotBeamLines(currSlot: SceneSlot) {
        if (currSlot.mesh != undefined) {
            currSlot.scene.remove(currSlot.mesh);
            currSlot.mesh = undefined;
        }

        console.log("rebuilding..");

        const linePoints: Vector3[] = [];
        const lineIdx: number[] = [];

        lineIdx.length = 0;
        linePoints.length = 0;

        currSlot.nodes.forEach(el => {
            linePoints.push(el.position);
        });

        currSlot.beams.forEach(currBeam => {
            const inv = this.invisibleNodesArray.find(
                el =>
                    (el.id == currBeam.node1 || el.id == currBeam.node2) &&
                    el.slotId == currSlot.id
            );

            if (inv != undefined) return;

            console.log("visible");

            if (currBeam.node1 == -1) return;
            if (currBeam.node2 == -1) return;

            lineIdx.push(currBeam.node1);
            lineIdx.push(currBeam.node2);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        geometry.setIndex(lineIdx);

        const lineMaterial = new THREE.LineBasicMaterial({
            color: "#7e543e"
        });

        currSlot.mesh = new THREE.LineSegments(geometry, lineMaterial);
        currSlot.scene.add(currSlot.mesh);
    }
    /**
     * Builds the beam lines
     */
    public buildBeamLines() {
        this.sceneSlot.forEach(currSlot => {
            this.builSlotBeamLines(currSlot);
        });
    }

    /**
     * post node and beams scene population
     */
    public postCalc() {
        this.sceneSlot.forEach(currSlot => {
            this.scene.add(currSlot.scene);
        });
    }

    /**
     * Scales nodes sprites
     * @param scaleFactor
     */
    public scaleNodeSprites(scaleFactor: number) {
        this.nodesSpriteScale = scaleFactor * 4;
        this.sceneSlot.forEach(currSlot => {
            currSlot.nodes.forEach(currNode => {
                currNode.scale.set(
                    this.nodesSpriteScale,
                    this.nodesSpriteScale,
                    1.0
                );
            });
        });
    }

    /**
     * sets nodes names visibility
     * @param state
     */
    public setNodesNameVisibility(state: boolean) {
        this.displayNodesName = state;

        this.sceneSlot.forEach(currSlot => {
            currSlot.nodes.forEach(currNode => {
                currNode.children[0].visible = this.displayNodesName;
            });
        });
    }

    /**
     * sets a node visibility
     * @param id nodeId
     * @param state
     */
    public setNodeVisibility(id: number, state: boolean, slotId?: number) {
        if (slotId == undefined) return;

        const currSlot = this.getSlotById(slotId);

        if (!currSlot) return;
        const currNode = currSlot.nodes.find(el => el.id == id);
        if (!currNode) return;

        currNode.visible = state;

        if (!state) {
            this.invisibleNodesArray.push({ id, slotId });

            this.nodesDragControl.forEach(el => {
                let obj = el.getObjects();
                obj = obj.filter(el => el != currNode);
            });
        } else {
            this.invisibleNodesArray = this.invisibleNodesArray.filter(
                el => el.id != id
            );

            this.nodesDragControl.forEach(el => {
                const obj = el.getObjects();
                obj.push(currNode);
            });
        }

        this.builSlotBeamLines(currSlot);
    }

    /**
     * Update sprite data
     * @param id nodeId
     * @param grpId grpId
     */
    public updateNodeSpriteGrp(id: number, grpId: number) {
        throw console.error("Not implemented");
    }

    /**
     * sets a group's visibility
     * @param id groupId
     * @param state
     */
    public setGroupVisibility(id: number, state: boolean, slotId?: number) {
        return;
    }

    /**
     * sets a group's visibility
     * @param id groupId
     * @param state
     */
    public setSlotVisibility(id: number, state: boolean, slotId: number) {
        const currSlot = this.getSlotById(slotId);

        if (!currSlot) return;

        currSlot.nodes.forEach(currNode => {
            currNode.visible = state;

            if (!state) {
                this.invisibleNodesArray.push({
                    id: currNode.userData.id,
                    slotId
                });

                this.nodesDragControl.forEach(el => {
                    let obj = el.getObjects();
                    obj = obj.filter(el => el != currNode);
                });
            } else {
                this.invisibleNodesArray = this.invisibleNodesArray.filter(
                    el => el.id != currNode.userData.id
                );

                this.nodesDragControl.forEach(el => {
                    const obj = el.getObjects();
                    obj.push(currNode);
                });
            }
        });

        this.builSlotBeamLines(currSlot);
    }

    /**
     * Set snap factor
     * @param factor factor
     */
    public setSnapFactor(factor: number) {
        //throw console.error("Not implemented");
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
        throw console.error("Not implemented");
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
        throw console.error("Not implemented");
    }

    private onNodeDragHoverOff(event: any) {
        throw console.error("Not implemented");
    }

    private onNodeDragStart(event: any) {
        throw console.error("Not implemented");
    }

    private onNodeDragEnd(event: any) {
        throw console.error("Not implemented");
    }

    private onNodeDragMove(event: any) {
        throw console.error("Not implemented");
    }

    public onMouseDown(event: MouseEvent, camera: THREE.Camera) {
        throw console.error("Not implemented");
    }

    public onMouseUp(event: any, camera: THREE.Camera) {
        throw console.error("Not implemented");
    }

    public onMouseMove(event: any) {
        throw console.error("Not implemented");
    }

    public onMouseDblClick(
        event: any,
        camera: THREE.Camera,
        view: rendererViewType
    ) {
        throw console.error("Not implemented");
    }

    /**
     * Keyboard Events
     * TODO: Maybe input manager?
     */

    public onKeyDown(e: KeyboardEvent) {
        throw console.error("Not implemented");
    }

    public onKeyUp(e: KeyboardEvent) {
        throw console.error("Not implemented");
    }

    /**
     * Editor modes
     */
    public switchEditorMode(control: ControlMode) {
        throw console.error("Not implemented");
    }
}
