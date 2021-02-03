import { Vector3 } from "three";
import { rendererViewType } from "../TruckEditorInterfaces";

export interface SceneNode {
    position: Vector3;
    visible: boolean;
    nodeInfo: {
        nodeId: number;
        nodeName: string;
        grpId: number;
    };
}

export default abstract class SceneController {
    protected scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public abstract dispose(): void;

    public abstract reset(): void;

    public abstract setSnapFactor(factor: number): void;
    public abstract onMouseDown(event: MouseEvent, camera: THREE.Camera): void;
    public abstract onMouseUp(event: any, camera: THREE.Camera): void;
    public abstract onMouseDblClick(
        event: any,
        camera: THREE.Camera,
        view: rendererViewType
    ): void;
    public abstract onMouseMove(event: any): void;
    public abstract onKeyDown(e: KeyboardEvent): void;
    public abstract onKeyUp(e: KeyboardEvent): void;

    public abstract addNodeToScene(nodeData: SceneNode): void;
    public abstract addBeamToScene(node1: number, node2: number): void;
    public abstract removeBeamFromScene(node1: number, node2: number): void;
    public abstract moveNodeSprite(
        id: number,
        position: { x: number; y: number; z: number }
    ): void;
    public abstract prepareNodes(): void;
    public abstract buildBeamLines(): void;
    public abstract postCalc(): void;

    public abstract scaleNodeSprites(scaleFactor: number): void;
    public abstract setNodesNameVisibility(state: boolean): void;
    public abstract setNodeVisibility(id: number, state: boolean): void;
    public abstract updateNodeSpriteGrp(id: number, grpId: number): void;
    public abstract setGroupVisibility(id: number, state: boolean): void;
}
