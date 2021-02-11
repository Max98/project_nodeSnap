import { EditorNode, EditorBeam } from "../TruckEditorInterfaces";
import TruckEditorManager from "../TruckEditorManagaer";
import TruckEditorRenderer from "../TruckEditorRenderer";

export default abstract class Editor {
    protected renderInstance: TruckEditorRenderer;

    constructor() {
        this.renderInstance = TruckEditorManager.getInstance().getRendererObj();
    }

    public abstract reset(): void;
    public abstract getData(): any;
    public abstract fetchData(): void;
    public abstract loadTruckData(): void;
    public abstract addNode(position: THREE.Vector3): void;
    public abstract moveNode(
        id: number,
        position: { x: number; y: number; z: number },
        isUndo?: boolean
    ): void;

    public abstract removeNode(id: number): void;
    public abstract setNodeVisibility(id: number, state: boolean): void;
    public abstract setNodeData(node: EditorNode): void;
    public abstract addBeam(beam: { node1: number; node2: number }): void;
    public abstract removeBeam(currBeamId: number): void;
    public abstract setBeamData(beam: EditorBeam): void;
    public abstract renameGrp(grpId: number, title: string): void;
    public abstract removeGrp(grpId: number, destroy?: boolean): void;
    public abstract addGrp(id: number, title: string, type: string): void;
    public abstract duplicateGrp(
        id: number,
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ): void;
    public abstract duplicateVisible(
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ): void;

    public abstract setGroupVisibility(id: number, state: boolean): void;
    public abstract setSlotVisibility(
        id: number,
        state: boolean,
        slotId: number
    ): void;
    public abstract scaleAll(factor: number, isHistory?: boolean): void;
    public abstract translateAll(
        offset: { x: number; y: number; z: number },
        isHistory?: boolean
    ): void;

    public abstract rotateAll(
        rot: number,
        axis: string,
        isHistory?: boolean
    ): void;
    public abstract requestUndo(): void;
}
