import myLogger from "electron-log";

import * as THREE from "three";

//We use our own camera modifed from the original OrbitCamera class from three.js
import { OrbitControls, MapControls } from "../js/EditorOrbitCamera.js";

import viewCube from "./Common/viewCube";
import SceneManager from "./SceneManager";

import {
    RendererViewData,
    rendererViewType,
    viewCameraType
} from "./TruckEditorInterfaces";

import TruckEditorManager from "./TruckEditorManagaer";
import { Vector3 } from "three";

class View {
    private id: number;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;

    private camera: THREE.Camera;
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D | null;
    private controls: OrbitControls | MapControls;

    private type: rendererViewType = rendererViewType.VIEW_DEFAULT;
    private cameraType: viewCameraType = viewCameraType.ORTHOGRAPHIC;

    private viewCube: viewCube | undefined;

    constructor(
        id: number,
        canvas: HTMLCanvasElement,
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        options: { type: rendererViewType; cameraType: viewCameraType } = {
            type: rendererViewType.VIEW_DEFAULT,
            cameraType: viewCameraType.ORTHOGRAPHIC
        }
    ) {
        this.id = id;
        this.renderer = renderer;
        this.scene = scene;
        this.canvas = canvas;

        this.canvas.width = canvas.clientWidth * window.devicePixelRatio;
        this.canvas.height = canvas.clientHeight * window.devicePixelRatio;

        this.type = options.type;

        if (options.cameraType == viewCameraType.PERSPECTIVE) {
            this.cameraType = viewCameraType.PERSPECTIVE;

            this.camera = new THREE.PerspectiveCamera(
                45,
                this.canvas.clientWidth / this.canvas.clientHeight,
                0.1,
                100000
            );
        } else {
            this.camera = new THREE.OrthographicCamera(
                canvas.width / -2,
                canvas.width / 2,
                canvas.height / 2,
                canvas.height / -2,
                0.1,
                100000
            );
        }

        /**
         * this is important for viewCube to work
         */
        this.camera.up.copy(new THREE.Vector3(0, 0, 1));

        this.controls = new OrbitControls(this.camera, canvas);

        /**
         * TODO: make this editor specific
         */
        this.controls.target = new Vector3(0, 0, 0);

        if (this.type == rendererViewType.VIEW_TOP) {
            this.camera.position.set(0, 0, 1000);
            // this.controls.minPolarAngle = -Math.PI;
            // this.controls.maxPolarAngle = -Math.PI;
            this.controls.enableRotate = false;
            // this.controls.rotateCtrl = true;
            this.camera.layers.enable(10);
        } else if (this.type == rendererViewType.VIEW_SIDE) {
            this.camera.position.set(-1000, 0, 0);
            this.controls.enableRotate = false;
            this.camera.layers.enable(11);
        } else if (this.type == rendererViewType.VIEW_FRONT) {
            this.camera.position.set(0, -2000, 0);
            this.controls.enableRotate = false;
            this.camera.layers.enable(12);
        } else {
            //rendererViewType.VIEW_MAIN and DEFAULT
            this.camera.position.set(-300, 200, 200);
            this.camera.layers.enable(13);
        }

        this.camera.layers.enable(1);

        this.controls.update();

        if (this.cameraType == viewCameraType.ORTHOGRAPHIC) {
            //this.controls.enableRotate = false;
            this.controls.screenSpacePanning = true;
        } else {
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.2;
        }

        this.canvasContext = canvas.getContext("2d");

        const viewCubeCanvas = this.canvas.parentElement!.getElementsByTagName(
            "canvas"
        )[1];

        if (viewCubeCanvas != undefined) {
            this.viewCube = new viewCube({
                canvas: viewCubeCanvas,
                camera: this.camera,
                control: this.controls,
                isOrtho:
                    this.cameraType == viewCameraType.ORTHOGRAPHIC
                        ? true
                        : false
            });
        }

        /**
         * Register mouse events
         */
        canvas.addEventListener("mouseup", e => this.onMouseUp(e, this.camera));
        canvas.addEventListener("mousedown", e =>
            this.onMouseDown(e, this.camera)
        );
        canvas.addEventListener("dblclick", e =>
            this.onMouseDblClick(e, this.camera)
        );
        canvas.addEventListener("mousemove", e =>
            this.onMouseMove(e, this.camera)
        );

        canvas.addEventListener("keydown", e => this.onKeyDown(e));
        canvas.addEventListener("keyup", e => this.onKeyUp(e));
    }

    /**
     * Dispose
     */
    public dispose() {
        if (this.viewCube != undefined) this.viewCube.dispose();
        if (this.canvasContext) this.canvasContext = null;

        this.controls.dispose();

        this.canvas.removeEventListener("mouseup", e =>
            this.onMouseUp(e, this.camera)
        );
        this.canvas.removeEventListener("mousedown", e =>
            this.onMouseDown(e, this.camera)
        );
        this.canvas.removeEventListener("dblclick", e =>
            this.onMouseDblClick(e, this.camera)
        );
        this.canvas.removeEventListener("mousemove", e =>
            this.onMouseMove(e, this.camera)
        );

        this.canvas.removeEventListener("keydown", e => this.onKeyDown(e));
        this.canvas.removeEventListener("keyup", e => this.onKeyUp(e));
    }

    public render(time: number) {
        if (this.canvasContext == null) return; //TODO: implement error here

        this.renderer.setSize(this.canvas.width, this.canvas.height);

        this.controls.update();

        this.renderer.render(this.scene, this.camera);

        if (this.viewCube != undefined) this.viewCube.render(time);

        this.canvasContext.drawImage(this.renderer.domElement, 0, 0);
    }

    /**
     * Returns the current used camera type
     * Can be either orthogonal or perspective
     */
    public getCameraType(): viewCameraType {
        return this.cameraType;
    }

    /**
     * Returns the current used camera
     * Can be either othogonal or perspective
     */
    public getCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
        if (this.cameraType == viewCameraType.PERSPECTIVE)
            return this.camera as THREE.PerspectiveCamera;

        return this.camera as THREE.OrthographicCamera;
    }

    /**
     * Returns camera control system
     */
    public getCameraControl(): OrbitControls {
        return this.controls;
    }

    /**
     * Returns the canvas of the current view
     */
    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Return the id of the current view
     */
    public getId(): number {
        return this.id;
    }

    /**
     * Returns the type of the current id: rendererViewType
     */
    public getType(): rendererViewType {
        return this.type;
    }

    public update() {
        this.canvas.width = this.canvas.clientWidth * window.devicePixelRatio;
        this.canvas.height = this.canvas.clientHeight * window.devicePixelRatio;

        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    private onMouseDown(event: MouseEvent, camera: THREE.Camera) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onMouseDown(event, camera);
    }
    private onMouseUp(event: MouseEvent, camera: THREE.Camera) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onMouseUp(event, camera);
    }
    private onMouseDblClick(event: MouseEvent, camera: THREE.Camera) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onMouseDblClick(event, camera, this.type);
    }
    private onMouseMove(event: MouseEvent, camera: THREE.Camera) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onMouseMove(event);
    }

    private onKeyDown(event: KeyboardEvent) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onKeyDown(event);
    }

    private onKeyUp(event: KeyboardEvent) {
        TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .onKeyUp(event);
    }
}

/**
 * Main Renderer code
 */
export default class TruckEditorRenderer {
                   private Log: myLogger.LogFunctions;
                   /**
                    *
                    * render propreties
                    *
                    */
                   private scene: THREE.Scene;
                   private renderer: THREE.WebGLRenderer;
                   private views: View[] = [];

                   /**
                    *
                    * User configs
                    *
                    */
                   private renderOptions = {
                       renderNodesNames: false,
                       antiAlias: false,
                       debugStatistics: false
                   };

                   /**
                    * Scene stuff
                    */
                   private s = 5;

                   private gridSize = 9600 * this.s;
                   private gridDivisions = 160 * this.s;
                   private gridTop?: THREE.GridHelper = undefined;
                   private gridFront?: THREE.GridHelper = undefined;
                   private gridSide?: THREE.GridHelper = undefined;
                   private SceneManager: SceneManager;

                   public getSceneManager(): SceneManager {
                       return this.SceneManager;
                   }

                   constructor() {
                       this.Log = myLogger.default.scope("TruckEditorRenderer");
                       this.Log.info("init");

                       this.renderer = new THREE.WebGLRenderer({
                           antialias: this.renderOptions.antiAlias
                       });
                       this.scene = new THREE.Scene();

                       //TODO: different scene controllers
                       this.SceneManager = new SceneManager(this.scene);

                       window.addEventListener("resize", () =>
                           this.onWindowResize()
                       );
                   }

                   public dispose() {
                       this.views.length = 0;
                       this.SceneManager.dispose();
                       this.scene.clear();

                       window.removeEventListener("resize", () =>
                           this.onWindowResize()
                       );
                   }

                   /**
                    * Create one or more views using an array of canvases
                    * @param canvasArray array of canvas (or can be just one)
                    * @param last3D set last canvas to a prespective camera and all other to ortho
                    */
                   public createViews(canvasArray: RendererViewData[]) {
                       this.renderer.setPixelRatio(window.devicePixelRatio);

                       if (canvasArray.length == 0) {
                           this.Log.error("No views found!");
                           return;
                       }

                       this.views.forEach(el => el.dispose());

                       this.views.length = 0;

                       for (let i = 0; i < canvasArray.length; i++) {
                           this.views.push(
                               new View(
                                   i,
                                   canvasArray[i].canvas,
                                   this.renderer,
                                   this.scene,
                                   {
                                       type: canvasArray[i].type,
                                       cameraType: canvasArray[i].cameraType
                                   }
                               )
                           );
                       }

                       this.populateScene();
                       this.update(0);
                   }

                   /**
                    * @returns views array
                    */
                   public getViews(): View[] {
                       return this.views;
                   }

                   private populateScene() {
                       this.scene.clear();

                       this.gridFront = new THREE.GridHelper(
                           this.gridSize,
                           this.gridDivisions,
                           0x4f4f4f,
                           0x272727
                       );
                       this.gridFront.position.set(0, 12200, 0);
                       this.gridFront.layers.set(12);
                       this.scene.add(this.gridFront);

                       this.gridSide = new THREE.GridHelper(
                           this.gridSize,
                           this.gridDivisions,
                           0x4f4f4f,
                           0x272727
                       );
                       this.gridSide.position.set(12000, 0, 0);
                       this.gridSide.rotateZ(-Math.PI / 2);
                       this.gridSide.layers.set(11);
                       this.scene.add(this.gridSide);

                       this.gridTop = new THREE.GridHelper(
                           this.gridSize,
                           this.gridDivisions,
                           0x4f4f4f,
                           0x272727
                       );
                       this.gridTop.position.set(0, 0, -12500);
                       this.gridTop.rotateX(Math.PI / 2);
                       this.gridTop.layers.set(10);
                       this.scene.add(this.gridTop);

                       const gridSpace = new THREE.GridHelper(
                           this.gridSize / this.s,
                           this.gridDivisions / this.s,
                           0x4f4f4f,
                           0x272727
                       );
                       gridSpace.position.set(0, 0, 0);
                       gridSpace.layers.set(13);
                       gridSpace.rotateX(-Math.PI / 2);
                       this.scene.add(gridSpace);

                       /*const axesHelper = new THREE.AxesHelper(100);
        axesHelper.position.set(-60.75, -60.75, 60.75);
        this.scene.add(axesHelper);*/
                   }

                   public async setGridFactor(
                       factor: number
                   ): Promise<boolean> {
                       this.gridTop!.scale.set(factor, factor, factor);

                       this.gridSide!.scale.set(factor, factor, factor);

                       this.gridFront!.scale.set(factor, factor, factor);

                       this.SceneManager.setSnapFactor(factor);

                       return true;
                   }

                   /**
                    *
                    */
                   private onWindowResize() {
                       this.views.forEach(el => {
                           switch (el.getCameraType()) {
                               case viewCameraType.ORTHOGRAPHIC: {
                                   const cam = el.getCamera() as THREE.OrthographicCamera;

                                   cam.left = el.getCanvas().clientWidth / -2;
                                   cam.right = el.getCanvas().clientWidth / 2;
                                   cam.top = el.getCanvas().clientHeight / 2;
                                   cam.bottom =
                                       el.getCanvas().clientHeight / -2;

                                   cam.updateProjectionMatrix();
                                   break;
                               }

                               case viewCameraType.PERSPECTIVE: {
                                   const cam = el.getCamera() as THREE.PerspectiveCamera;

                                   cam.aspect =
                                       el.getCanvas().clientWidth /
                                       el.getCanvas().clientHeight;

                                   cam.updateProjectionMatrix();
                                   break;
                               }
                           }

                           el.update();
                       });
                   }

                   public onViewsResize() {
                       this.onWindowResize(); //same thing
                   }

                   /**
                    * Main function
                    */
                   private update(time: number) {
                       requestAnimationFrame(e => this.update(e));

                       for (let i = 0; i < this.views.length; ++i) {
                           this.views[i].render(time);
                       }
                   }
               }
