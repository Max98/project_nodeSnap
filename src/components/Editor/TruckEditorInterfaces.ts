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
