export enum rendererViewType {
    /**editor specific */
    VIEW_TOP,
    VIEW_SIDE,
    VIEW_FRONT,
    VIEW_MAIN,

    /** default */
    VIEW_DEFAULT
}

export enum viewCameraType {
    PERSPECTIVE,
    ORTHOGRAPHIC
}

export interface RendererViewData {
    canvas: HTMLCanvasElement;
    type: rendererViewType;
    cameraType: viewCameraType;
}

/**
 * Editor specific
 */
export interface EditorNode {
    id: number; //we parse as string
    name: string;
    x: number;
    y: number;
    z: number;
    options: string;
    grp_id: number;

    parserData?: any; //to store stuff like sbd/snd
    isVisible: boolean;
}
export interface EditorBeam {
    id: number;
    node1: number;
    node2: number;
    node1Name?: string;
    node2Name?: string;
    options: string;
    grp_id: number;

    parserData?: any; //to store stuff like sbd/snd
    isVisible: boolean;
}
export interface EditorGroup {
    grp_id: number;
    title: string;
    type: string;

    isVisible: boolean;
}

/**
 * BeamNG specific
 */
export interface EditorSlot {
    id: number;
    name: string;
    type: string;
    isVisible: boolean;
}

export interface EditorTruckData {
    nodes: EditorNode[];
    beams: EditorBeam[];
    groups: EditorGroup[];
    slot?: EditorSlot;
}

export enum editorType {
    ROR,
    BEAMNG
}
