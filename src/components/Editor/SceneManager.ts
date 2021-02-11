import * as THREE from "three";
import SceneController from "./Common/SceneController";
import RoRSceneController from "./RoR/Scene/sceneController";
import BlueprintPlugin from "./Common/Plugins/blueprint";
import BluemodelPlugin from "./Common/Plugins/bluemodel";
import Config from "./Common/Plugins/config";

import {
    RendererViewData,
    rendererViewType,
    viewCameraType
} from "./TruckEditorInterfaces";
import BeamNGSceneController from "./BeamNG/Scene/sceneController";

export default class SceneManager {
    private scene: THREE.Scene;
    private sceneController: SceneController;

    private blueprintSystem: BlueprintPlugin;
    private bluemodelSystem: BluemodelPlugin;

    /**
     * Config system
     */
    private projectConfig: Config;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.projectConfig = new Config();

        this.blueprintSystem = new BlueprintPlugin(this.scene);
        this.bluemodelSystem = new BluemodelPlugin(this.scene);

        this.sceneController = new BeamNGSceneController(this.scene);

        console.log("hai");
    }

    public dispose() {
        console.log("dispose");
    }

    public reset() {
        console.log("reset");
    }

    public setSnapFactor(factor: number) {}
    public onMouseDown(event: MouseEvent, camera: THREE.Camera) {}
    public onMouseUp(event: any, camera: THREE.Camera) {}
    public onMouseDblClick(
        event: any,
        camera: THREE.Camera,
        view: rendererViewType
    ) {}
    public onMouseMove(event: any) {}
    public onKeyDown(e: KeyboardEvent) {}
    public onKeyUp(e: KeyboardEvent) {}

    public getCurrSceneController(): SceneController {
        return this.sceneController;
    }

    public getBlueprintSystem() {
        return this.blueprintSystem;
    }

    public getBluemodelSystem() {
        return this.bluemodelSystem;
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
