import fs from "fs";
import * as THREE from "three";
import { rendererViewType } from "../../TruckEditorInterfaces";
import TruckEditorManager from "../../TruckEditorManagaer";
import mime from "mime-types";
import { TransformControls } from "@/components/Editor/js/TransformControls";

import OgreLoader from "@/components/Editor/ts/Renderer/Loaders/OgreLoader";
import { useToast } from "vue-toastification";

export default class BluemodelPlugin {
    private scene: THREE.Scene;
    private defaultOpacity = 1;

    private blueModelFilePath = "";
    private blueModel: THREE.Mesh | undefined;
    private control: TransformControls | undefined;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public getBlueModelFilePath() {
        return this.blueModelFilePath;
    }

    public load(filePath: string, opacity: number) {
        this.remove();

        this.defaultOpacity = opacity;
        this.blueModelFilePath = filePath;

        const fileStr = filePath.split(".");
        const type = fileStr[fileStr.length - 1];

        //TODO: convert mesh files to mesh.xml using OgreConverter
        if (type == "xml") {
            const loader = new OgreLoader(filePath);
            this.blueModel = loader.getMesh();
        } else {
            useToast().error("Unsupported file type: " + type);
        }

        if (this.blueModel == undefined) {
            console.log("failed to load mesh");
            return;
        }

        const mat = this.blueModel.material as THREE.MeshBasicMaterial;
        mat.wireframe = true;
        mat.transparent = true;
        mat.opacity = this.defaultOpacity;

        const views = TruckEditorManager.getInstance()
            .getRendererObj()
            .getViews();

        views.forEach(el => {
            if (
                el.getType() !=
                (rendererViewType.VIEW_MAIN || rendererViewType.VIEW_DEFAULT)
            )
                return; //we only need the main view here

            this.control = new TransformControls(
                el.getCamera(),
                el.getCanvas()
            );

            this.control.attach(this.blueModel as THREE.Object3D);
            this.control.setRotationSnap(THREE.MathUtils.degToRad(15));
            this.control.setScaleSnap(0.1);

            this.control.layers.set(13);

            this.control.addEventListener("dragging-changed", e => {
                el.getCameraControl().enabled = !e.value;
            });
        });

        this.scene.add(this.blueModel);

        if (this.control) this.scene.add(this.control);

        this.setControlState(false);

        return;
    }

    public getBlueModel(): THREE.Mesh | undefined {
        return this.blueModel;
    }

    public remove() {
        if (!this.blueModel) return;

        this.scene.remove(this.blueModel);
        this.blueModel = undefined;
    }

    public toggleVisibility() {
        if (!this.blueModel) return;

        this.blueModel.visible = !this.blueModel.visible;
    }

    public setOpacity(opacity: number) {
        if (!this.blueModel) return;

        this.defaultOpacity = opacity;

        const mat = this.blueModel.material as THREE.MeshBasicMaterial;
        mat.opacity = opacity;
    }

    public setControlState(state: boolean) {
        if (!this.blueModel) return;
        if (!this.control) return;

        this.control.showX = state;
        this.control.showY = state;
        this.control.showZ = state;
        this.control.enabled = state;

        const mat = this.blueModel.material as THREE.MeshBasicMaterial;
        if (state == true) {
            mat.opacity = 0.3;
        } else {
            mat.opacity = this.defaultOpacity;
        }

        if (state == false) {
            document.removeEventListener("keyup", e => this.keyUp(e));
        } else {
            document.addEventListener("keyup", e => this.keyUp(e));
        }
    }

    /**
     *
     * @param type "translate", "rotate", "scale"
     */
    public switchControl(type: string) {
        if (!this.control) return;

        this.control.setMode(type);
    }

    public keyUp(e: KeyboardEvent) {
        switch (e.key) {
            case "r":
            case "R":
                this.switchControl("rotate");
                break;

            case "s":
            case "S":
                this.switchControl("scale");
                break;

            case "t":
            case "T":
                this.switchControl("translate");
                break;

            default:
                break;
        }
    }
}
