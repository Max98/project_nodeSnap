import { Camera, EventDispatcher, Object3D } from "three";
import { rendererViewType } from "../ts/TruckEditorInterfaces";

export class DragControls extends EventDispatcher {
    constructor(objects: Object3D[], camera: Camera, domElement?: HTMLElement);

    object: Camera;

    // API

    enabled: boolean;
    transformGroup: boolean;
    mouseButton: id;
    view: rendererViewType;

    activate(): void;
    deactivate(): void;
    dispose(): void;
    getObjects(): Object3D[];
}
