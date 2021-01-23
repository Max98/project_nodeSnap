import fs from "fs";
import * as THREE from "three";
import { rendererViewType } from "../../TruckEditorInterfaces";
import TruckEditorManager from "../../TruckEditorManagaer";
import mime from "mime-types";
import { TransformControls } from "@/components/Editor/js/TransformControls";

export default class BlueprintPlugin {
    private bluePrintArray: {
        model: THREE.Mesh;
        control: TransformControls;
    }[] = [];
    private scene: THREE.Scene;
    private defaultOpacity = 1;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    private getImageDimensions(file: string): { w: number; h: number } | any {
        return new Promise(function(resolved, rejected) {
            const i = new Image();
            i.onload = function() {
                resolved({ w: i.width, h: i.height });
            };
            i.src = file;
        });
    }

    public async load(filePath: string, opacity: number) {
        this.remove(); //we remove anything old

        this.defaultOpacity = opacity;

        const dataURI = fs.readFileSync(filePath, "base64");

        const imgData = `data:${mime.lookup(filePath)};base64,` + dataURI;

        const texture = new THREE.TextureLoader().load(imgData);
        texture.anisotropy = 16;

        const dimensions: {
            w: number;
            h: number;
        } = await this.getImageDimensions(imgData);

        const views = TruckEditorManager.getInstance()
            .getRendererObj()
            .getViews();

        views.forEach(el => {
            if (
                el.getType() ==
                (rendererViewType.VIEW_MAIN || rendererViewType.VIEW_DEFAULT)
            )
                return;

            const material = new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture
            });
            material.opacity = this.defaultOpacity;

            material.side = THREE.DoubleSide;

            const geometryPlane = new THREE.PlaneGeometry(
                dimensions.w,
                dimensions.h
            );

            const bluePrintPlane = new THREE.Mesh(geometryPlane, material);

            switch (el.getType()) {
                case rendererViewType.VIEW_TOP:
                    bluePrintPlane.position.setZ(-12505);
                    bluePrintPlane.rotateZ(Math.PI / 2);

                    bluePrintPlane.layers.set(10);

                    break;
                case rendererViewType.VIEW_SIDE:
                    bluePrintPlane.position.setX(12001);
                    bluePrintPlane.rotateY(-Math.PI / 2);
                    bluePrintPlane.rotateZ(-Math.PI / 2);
                    bluePrintPlane.scale.x = -1;

                    bluePrintPlane.layers.set(11);

                    break;
                case rendererViewType.VIEW_FRONT:
                    bluePrintPlane.position.setY(12201);
                    bluePrintPlane.rotateX(Math.PI / 2);
                    bluePrintPlane.layers.set(12);
                    break;
                default:
                    break;
            }

            const control = new TransformControls(
                el.getCamera(),
                el.getCanvas()
            );

            //bluePrintPlane.scale.set(100, 100, 100);
            this.scene.add(bluePrintPlane);

            control.attach(bluePrintPlane);
            control.setRotationSnap(THREE.MathUtils.degToRad(15));
            control.setScaleSnap(0.1);

            this.scene.add(control);

            this.bluePrintArray.push({
                model: bluePrintPlane,
                control
            });
        });
        this.setControlState(false);
    }

    public remove() {
        this.bluePrintArray.forEach(bluPrt => {
            this.scene.remove(bluPrt.model);
            bluPrt.control.clear();
            bluPrt.control.dispose();
            this.scene.remove(bluPrt.control);
        });
        this.bluePrintArray = [];
    }

    public toggleVisibility() {
        this.bluePrintArray.forEach(bluPrt => {
            bluPrt.model.visible = !bluPrt.model.visible;
        });
    }

    public setOpacity(opacity: number) {
        this.defaultOpacity = opacity;

        this.bluePrintArray.forEach(bluPrt => {
            const mat = bluPrt.model.material as THREE.MeshBasicMaterial;
            mat.opacity = opacity;
        });
    }

    /**
     *
     * @param type "translate", "rotate", "scale"
     */
    public switchControl(type: string) {
        this.bluePrintArray.forEach(el => {
            el.control.setMode(type);
        });
    }

    public setControlState(state: boolean) {
        this.bluePrintArray.forEach(el => {
            el.control.showX = state;
            el.control.showY = state;
            el.control.showZ = state;
            el.control.enabled = state;

            const mat = el.model.material as THREE.MeshBasicMaterial;
            if (state == true) {
                mat.opacity = 0.3;
            } else {
                mat.opacity = this.defaultOpacity;
            }
        });

        if (state == false) {
            document.removeEventListener("keyup", e => this.keyUp(e));
        } else {
            document.addEventListener("keyup", e => this.keyUp(e));
        }
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
