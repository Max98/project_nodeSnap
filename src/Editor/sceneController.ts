import * as THREE from "three";
import {
  EditorNode,
  EditorBeam,
  rendererViewType,
  EditorSlot,
} from "./EditorDataInterfaces";
// import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { DragControls } from "./Ex/js/DragControls.js";
import { ConeBufferGeometry, Vector3 } from "three";
import EditorManager from "./EditorManager";
import Editor from "./Editor";
import ContextMenu from "../Components/vanilla-context-menu";

enum ControlMode {
  TRUCK,
  BLUEPRINT,
}

interface SceneSlot {
  id: number;
  visible: boolean;
  title: string;

  nodes: THREE.Sprite[];
  beams: EditorBeam[];

  scene: THREE.Scene;
  mesh?: THREE.LineSegments;
}

export default class SceneController {
  private sceneSlot: SceneSlot[] = [];

  private scene: THREE.Scene;

  private displayNodesName = false;
  private nodesDragControl: DragControls[] = [];
  private isNodeMove = false;

  private invisibleNodesArray: {
    id: number;
    slotId: number;
  }[] = [];

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

  private editorManager: EditorManager;

  constructor(scene: THREE.Scene, _EditorManager: EditorManager) {
    console.log("init");

    this.scene = scene;

    this.editorManager = _EditorManager;
  }

  public dispose() {
    this.reset();
    console.log("Dispose");
  }

  /** Main editor functions */

  public reset() {
    this.removeDragControl();

    this.invisibleNodesArray.length = 0;

    this.sceneSlot.forEach((slot) => {
      this.scene.remove(slot.scene);
    });

    this.sceneSlot.length = 0;
  }

  /**
   * Resets the editor scene
   */
  public removeDragControl() {
    this.nodesDragControl.forEach((dragControl) => {
      dragControl.removeEventListener("hoveron", (e) =>
        this.onNodeDragHoverOn(e)
      );
      dragControl.removeEventListener("hoveroff", (e) =>
        this.onNodeDragHoverOff(e)
      );
      dragControl.removeEventListener("drag", (e) => this.onNodeDragMove(e));
      dragControl.removeEventListener("dragstart", (e) =>
        this.onNodeDragStart(e)
      );
      dragControl.removeEventListener("dragend", (e) => this.onNodeDragEnd(e));

      dragControl.dispose();
    });

    this.nodesDragControl.length = 0;
  }

  /**
   * Add new slot to scene
   * @param id
   * @param title
   * @param visible
   */
  public addSlot(id: number, title: string, visible = true) {
    this.sceneSlot.push({
      id,
      title,
      visible,
      nodes: [],
      beams: [],
      scene: new THREE.Scene(),
    });
  }

  /**
   * Add new node to scene
   * @param node
   * @param slotId
   * @returns
   */
  public addNode(node: EditorNode, slotId: number) {
    const currSlot = this.getSlotById(slotId);

    if (!currSlot) {
      console.error("Slot not found");
      return;
    }

    const spriteMaterial = new THREE.SpriteMaterial({
      color: "green",
    });

    const newNode = new THREE.Sprite(spriteMaterial);
    newNode.scale.set(this.nodesSpriteScale, this.nodesSpriteScale, 1.0);

    newNode.position
      .copy(node.position)
      .multiplyScalar(this.nodesPosRenderScale);

    newNode.userData = {
      id: node.info.id,
      name: node.info.name,
      grpId: node.info.grpId,
      slotId: currSlot.id,
      slot: currSlot.title,
    };

    newNode.layers.set(1);
    const spritey = this.makeTextSprite(`${node.info.name.toString()}`);

    if (spritey) {
      spritey.visible = this.displayNodesName;
      newNode.add(spritey);
      spritey.layers.set(0);
    }

    this.nodesDragControl.forEach((el) => {
      const obj = el.getObjects();
      obj.push(newNode);
    });

    newNode.visible = node.isVisible;

    currSlot.nodes.push(newNode);
    currSlot.scene.add(newNode);
  }

  /**
   * Add new beam to scene
   * @param beam
   * @param slotId
   * @returns
   */
  public addBeam(beam: EditorBeam, slotId: number) {
    const currSlot = this.getSlotById(slotId);
    if (!currSlot) {
      console.error("Slot not found");
      return;
    }

    currSlot.beams.push(beam);
  }

  public removeBeam(slotId: number, beamId: number) {
    const currSlot = this.getSlotById(slotId);

    if (!currSlot) {
      console.error("Slot not found");
      return;
    }

    currSlot.beams = currSlot.beams.filter(
      (currBeam) => currBeam.info.id != beamId
    );
  }

  public updateBeam(slotId: number, beam: EditorBeam) {
    const currSlot = this.getSlotById(slotId);

    if (!currSlot) {
      console.error("Slot not found");
      return;
    }

    const currBeam = currSlot.beams.find(
      (currBeam) => currBeam.info.id == beam.info.id
    )!;

    Object.assign(currBeam, beam);
  }

  /**
   * Build all beams
   */
  public buildBeamLines() {
    this.sceneSlot.forEach((currSlot) => {
      /**
       * Build beams
       */
      if (currSlot.mesh != undefined) {
        currSlot.scene.remove(currSlot.mesh);
        currSlot.mesh = undefined;
      }

      const linePoints: Vector3[] = [];
      const lineIdx: number[] = [];

      lineIdx.length = 0;
      linePoints.length = 0;

      currSlot.nodes.forEach((el) => {
        linePoints.push(el.position);
      });

      currSlot.beams.forEach((currBeam) => {
        const inv = this.invisibleNodesArray.find(
          (el) =>
            (el.id == currBeam.node1 || el.id == currBeam.node2) &&
            el.slotId == currSlot.id
        );

        if (inv != undefined) return;

        if (currBeam.node1 == -1) return;
        if (currBeam.node2 == -1) return;

        lineIdx.push(currBeam.node1);
        lineIdx.push(currBeam.node2);
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(linePoints);
      geometry.setIndex(lineIdx);

      const lineMaterial = new THREE.LineBasicMaterial({
        color: "#7e543e",
      });

      currSlot.mesh = new THREE.LineSegments(geometry, lineMaterial);

      currSlot.scene.add(currSlot.mesh);
    });
  }

  public finalize() {
    this.buildBeamLines();

    this.sceneSlot.forEach((currSlot) => {
      /**
       * Prepare nodes
       */

      EditorManager.getInstance()
        .getRenderer()
        .getViews()
        .forEach((el) => {
          const dragControl = new DragControls(
            [...currSlot.nodes],
            el.getCamera(),
            el.getCanvas()
          );
          this.nodesDragControl.push(dragControl);

          dragControl.addEventListener("hoveron", (e) =>
            this.onNodeDragHoverOn(e)
          );
          dragControl.addEventListener("hoveroff", (e) =>
            this.onNodeDragHoverOff(e)
          );
          dragControl.addEventListener("drag", (e) => this.onNodeDragMove(e));
          dragControl.addEventListener("dragstart", (e) =>
            this.onNodeDragStart(e)
          );
          dragControl.addEventListener("dragend", (e) => this.onNodeDragEnd(e));

          dragControl.mouseButton = 0; //Only mouse button 0 drags nodes (Left click)
          dragControl.view = el.getType();

          /**
           * We do not want to drag nodes on the main view
           */
          if (el.getType() == rendererViewType.VIEW_MAIN)
            dragControl.enabled = false;
        });

      /**
       * Add to scene
       */
      if (currSlot.visible) this.scene.add(currSlot.scene);
    });
  }

  private getSlotById(id: number): SceneSlot | undefined {
    return this.sceneSlot.find((el) => el.id == id);
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
          Math.round(pos.x / (this.snapScale * this.snapScaleFactor)) *
            this.snapScale *
            this.snapScaleFactor
        );

        pos.y = Math.trunc(
          Math.round(pos.y / (this.snapScale * this.snapScaleFactor)) *
            this.snapScale *
            this.snapScaleFactor
        );

        pos.z = Math.trunc(Math.round(pos.z));
        break;

      case rendererViewType.VIEW_SIDE:
        pos.z = Math.trunc(
          Math.round(pos.z / (this.snapScale * this.snapScaleFactor)) *
            this.snapScale *
            this.snapScaleFactor
        );

        pos.y = Math.trunc(
          Math.round(pos.y / (this.snapScale * this.snapScaleFactor)) *
            this.snapScale *
            this.snapScaleFactor
        );

        pos.x = Math.trunc(Math.round(pos.x));
        break;

      case rendererViewType.VIEW_FRONT:
        pos.z = Math.trunc(
          Math.round(pos.z / (this.snapScale * this.snapScaleFactor)) *
            this.snapScale *
            this.snapScaleFactor
        );

        pos.x = Math.trunc(
          Math.round(pos.x / (this.snapScale * this.snapScaleFactor)) *
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

  /**
   * Set snap factor
   * @param factor factor
   */
  public setSnapFactor(factor: number) {
    this.snapScaleFactor = factor;
  }

  /**
   * sets a slot's visibility
   * @param id slotId
   * @param state
   */
  public setSlotVisibility(id: number, state: boolean) {
    const currSlot = this.getSlotById(id);

    if (!currSlot) {
      console.error("Slot not found");
      return;
    }

    currSlot.visible = state;

    if (!state) this.scene.remove(currSlot.scene);
    else this.scene.add(currSlot.scene);
  }

  private processNodeVisiblity(
    slotId: number,
    currNode: THREE.Sprite,
    state: boolean
  ) {
    currNode.visible = state;
    if (!state) {
      this.invisibleNodesArray.push({ id: currNode.userData.id, slotId });

      this.nodesDragControl.forEach((control) => {
        let obj = control.getObjects();
        obj = obj.filter((node) => node != currNode);
      });
    } else {
      this.invisibleNodesArray = this.invisibleNodesArray.filter(
        (node) =>
          node.id != currNode.userData.id ||
          node.slotId != currNode.userData.slotId
      );

      this.nodesDragControl.forEach((control) => {
        const obj = control.getObjects();
        obj.push(currNode);
      });
    }
  }

  /**
   * sets a group's visibility
   * @param id groupId
   * @param state
   */
  public setGrpVisibility(slotId: number, grpId: number, state: boolean) {
    const nodesArray = this.getSlotById(slotId)!.nodes.filter(
      (node) => node.userData.grpId == grpId
    );

    nodesArray.forEach((currNode) => {
      this.processNodeVisiblity(slotId, currNode, state);
    });

    console.log(this.invisibleNodesArray);

    this.buildBeamLines();
  }

  /**
   * sets a node visibility
   * @param id nodeId
   * @param state
   */
  public setNodeVisibility(slotId: number, nodeId: number, state: boolean) {
    const currNode = this.getSlotById(slotId)!.nodes.find(
      (node) => node.userData.id == nodeId
    );

    if (!currNode) {
      console.error("node not found");
      return;
    }

    this.processNodeVisiblity(slotId, currNode, state);

    this.buildBeamLines();
  }

  /**
   *
   */
  public moveNodeSprite(
    slotId: number,
    nodeId: number,
    position: THREE.Vector3
  ) {
    const sprite = this.getSlotById(slotId)!.nodes.find(
      (currNode) => currNode.userData.id == nodeId
    );

    if (sprite != undefined) {
      sprite.position.x = position.x * this.nodesPosRenderScale;
      sprite.position.y = position.y * this.nodesPosRenderScale;
      sprite.position.z = position.z * this.nodesPosRenderScale;
    }
  }

  /*
    Author: Lee Stemkoski
    Just made it work since it was from 2013
    */
  private makeTextSprite(message: string) {
    const parameters = {
      fontface: "Arial",
      fontsize: 24,
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
      map: texture,
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
    console.log("HOVER");
    const currObj = event.object;

    console.log(currObj);

    currObj.material.color.g = 0;
    currObj.material.color.r = 1;
    currObj.material.color.b = 0;

    const currSlot = this.sceneSlot.find(
      (el) => el.id == currObj.userData.slotId
    );

    if (!currSlot) return;

    if (this.makeBeamPt.length == 1) {
      if (this.tempBeamLine != undefined) {
        this.scene.remove(this.tempBeamLine);
      }

      const firstNode = currSlot.nodes.find(
        (el) => el.userData.id == this.makeBeamPt[0]
      );
      if (firstNode == undefined) {
        return;
      }

      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff,
      });

      const points = [];
      points.push(firstNode.position);
      points.push(currObj.position);

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.tempBeamLine = new THREE.Line(geometry, material);

      console.log(this.tempBeamLine);
      this.scene.add(this.tempBeamLine);
    } else {
      if (this.tempBeamLine != undefined) {
        this.scene.remove(this.tempBeamLine);
      }
    }
  }

  /**
   * Events
   *
   */

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

      this.editorManager
        .getEditorObj()
        .moveNode(
          currObj.userData.id,
          currObj.userData.slotId,
          currObj.position
        );
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
    this.nodesDragControl.forEach((el) => {
      el.activate();
    });
  }

  public onMouseUp(event: any, camera: THREE.Camera) {
    if (event.button == 2) {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(this.mouse, camera);
      //We need only the nodes layer
      raycaster.layers.set(1);

      const intersects = raycaster.intersectObjects(this.getAllNodes());

      if (intersects.length > 0) {
        //Deactivate the drag nodes system to prevent bugs
        this.nodesDragControl.forEach((el) => {
          el.deactivate();
        });

        new ContextMenu(event, [
          {
            label: "Delete node",
            callback: () => {
              this.editorManager
                .getEditorObj()
                .removeNode(
                  intersects[0].object.userData.id,
                  intersects[0].object.userData.slotId
                );
            },
          },
          "hr",
        ]);
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
    if (view == (rendererViewType.VIEW_MAIN || rendererViewType.VIEW_DEFAULT))
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

    this.editorManager
      .getEditorObj()
      .addNode(nodePos.multiplyScalar(1 / this.nodesPosRenderScale));
  }

  /**
   * Keyboard Events
   * TODO: Maybe input manager?
   */

  public onKeyDown(e: KeyboardEvent) {
    if (e.shiftKey) {
      const mainView = this.editorManager
        .getRenderer()
        .getViews()
        .find((el) => el.getType() == rendererViewType.VIEW_MAIN);
      if (mainView != undefined) {
        mainView.getCameraControl().enableRotate = false;
      }

      this.nodesDragControl.forEach((el) => {
        el.enabled = false;
      });
    }

    switch (e.key) {
      case "Z":
      case "z":
        if (e.ctrlKey) {
          //  if (this.controlMode == ControlMode.TRUCK) {
          //    TruckEditorManager.getInstance().getEditorObj().requestUndo();
          //  }
        }
        break;

      case "B":
      case "b":
        if (e.ctrlKey) {
          //  this.switchEditorMode(ControlMode.BLUEPRINT);
          //  useToast().info("Switching to blueprint edit");
        }
        break;

      case "N":
      case "n":
        if (e.ctrlKey) {
          //  this.switchEditorMode(ControlMode.TRUCK);
          //  useToast().info("Switching to truck edit");
        }
        break;

      default:
        //  if (this.controlMode == ControlMode.TRUCK) {
        if (e.ctrlKey) {
          this.snapEnable = true;
        }
        if (e.shiftKey) {
          this.makeBeam = true;

          if (this.makeBeamPt.length > 1) {
            this.editorManager
              .getEditorObj()
              .addBeam(this.makeBeamPt[0], this.makeBeamPt[1]);
            this.makeBeamPt = [];
          }
        }
        //  }
        break;
    }
  }

  public onKeyUp(e: KeyboardEvent) {
    const mainView = this.editorManager
      .getRenderer()
      .getViews()
      .find((el) => el.getType() == rendererViewType.VIEW_MAIN);
    if (mainView != undefined) {
      mainView.getCameraControl().enableRotate = true;
    }

    this.nodesDragControl.forEach((el) => {
      el.enabled = true;
    });

    switch (e.key) {
      default:
        // if (this.controlMode == ControlMode.TRUCK) {
        this.snapEnable = false;
        this.makeBeam = false;
        // }

        break;
    }
  }

  private getAllNodes() {
    const nodes: THREE.Sprite[] = [];

    this.sceneSlot.forEach((el) => {
      el.nodes.forEach((node) => {
        nodes.push(node);
      });
    });

    return nodes;
  }
}
