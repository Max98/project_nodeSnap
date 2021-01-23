import * as THREE from "three";
import { Vector2, Vector3, Euler } from "three";

import { OrbitControls, MapControls } from "../../js/EditorOrbitCamera.js";

/**
 * Code from https://github.com/yoavmil/angular-threejs-starter/tree/nav-cube/src/app/nav-cube
 */
export interface NavCubeParams {
    camera: THREE.Camera;
    canvas: HTMLCanvasElement;

    champer: number; // precentage
    faceColor: number;
    edgeColor: number;
    vertexColor: number;

    // tween: boolean = false; TODO
    // showHome: boolean = false; TODO
    // highLight: boolean = false; TODO
}

enum Sides {
    Front = 1 << 1,
    Back = 1 << 2,
    Left = 1 << 3,
    Right = 1 << 4,
    Top = 1 << 5,
    Bottom = 1 << 6
}

export default class NavCube {
    params: NavCubeParams;
    renderer: THREE.WebGLRenderer;
    localCamera: THREE.PerspectiveCamera;
    cubeMesh: THREE.Mesh;
    scene: THREE.Scene;
    radius = 2;

    control: OrbitControls | MapControls;

    isOrtho = false;

    constructor(params: {
        canvas: HTMLCanvasElement;
        camera: THREE.Camera;
        control: OrbitControls | MapControls;
        isOrtho?: boolean;
    }) {
        if (params.isOrtho != undefined) this.isOrtho = params.isOrtho;
        this.control = params.control;

        this.params = {
            canvas: params.canvas,
            camera: params.camera,
            champer: 0.15,
            faceColor: 0xd6d7dc,
            edgeColor: 0xb1c5d4,
            vertexColor: 0x71879a
        };

        if (
            this.params.canvas.clientWidth == 0 ||
            this.params.canvas.clientHeight == 0
        )
            throw new Error("div client width or height == 0");

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.params.canvas,
            antialias: true,
            alpha: true
        });

        this.renderer.setPixelRatio(window.devicePixelRatio);

        const canvasWidth =
            this.params.canvas.clientWidth * window.devicePixelRatio;
        const canvasHeight =
            this.params.canvas.clientHeight * window.devicePixelRatio;

        this.renderer.setSize(canvasWidth, canvasHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        //this.params.canvas.appendChild(this.renderer.domElement);
        this.renderer.setClearColor(0, 0); // transparent background

        this.cubeMesh = new THREE.Mesh();
        this.createMainFacets();
        this.createEdgeFacets();
        this.createCornerFacets();
        this.createLabels();

        this.scene = new THREE.Scene();
        this.scene.add(this.cubeMesh);

        const ratio =
            this.params.canvas.clientWidth / this.params.canvas.clientHeight;
        this.localCamera = new THREE.PerspectiveCamera(45, ratio, 0.01, 500);
        this.localCamera.up = this.params.camera.up.clone();

        this.params.canvas.onclick = (event: MouseEvent) => {
            this.onClick(event);
        };
    }

    public dispose() {
        this.renderer.dispose();
    }

    private onSideCliked(mesh: THREE.Mesh, normal: Vector3) {
        this.control.enabled = false;
        const camLen = this.params.camera.position.length();

        if (normal.equals(this.params.camera.up)) {
            normal.applyAxisAngle(new Vector3(1, 0, 0).normalize(), 0);
        }

        const newCamRot = new Euler().copy(this.params.camera.rotation);

        const lookAt = new Vector3().copy(this.control.target);

        console.log(this.params.camera.rotation);

        let dist = this.control.target.distanceTo(this.params.camera.position);

        switch (mesh.userData.sides) {
            case Sides.Bottom:
            case Sides.Top:
                lookAt.z = 0;
                if (this.params.camera.position.z < 0) {
                    dist = -dist;
                }

                this.params.camera.position.set(lookAt.x, lookAt.y, dist);
                this.control.target = lookAt;

                break;

            case Sides.Right:
            case Sides.Left:
                lookAt.z = 0;
                lookAt.x = 0;
                if (this.params.camera.position.x < 0) {
                    dist = -dist;
                }
                this.params.camera.position.set(dist, lookAt.y, lookAt.z);
                this.control.target = lookAt;
                break;

            case Sides.Back:
            case Sides.Front:
                lookAt.z = 0;
                lookAt.y = 0;

                if (this.params.camera.position.y < 0) {
                    dist = -dist;
                }

                this.params.camera.position.set(lookAt.x, dist, lookAt.z);
                this.control.target = lookAt;
                break;

            default:
                break;
        }
        this.control.enabled = true;
        //this.params.camera.position.set(300, 0, 300);
    }

    private onClick(event: MouseEvent) {
        if (this.cubeMesh) {
            const xy = {
                x: +(event.offsetX / this.params.canvas.clientWidth) * 2 - 1,
                y: -(event.offsetY / this.params.canvas.clientHeight) * 2 + 1
            };
            const ray = new THREE.Raycaster();
            ray.setFromCamera(xy, this.localCamera);
            const intersects = ray.intersectObjects(
                this.cubeMesh.children,
                false
            );
            intersects.forEach((intersection, i) => {
                if (intersection.object.userData.sides) {
                    this.onSideCliked(
                        intersection.object as THREE.Mesh,
                        intersection.face!.normal
                    );
                    return;
                }
            });
        }
    }

    createMainFacets() {
        // it's math: the projection of the champer on the plane is champer / sqrt(2)
        // (Pythagoras), reduce from both side and you get:
        const width = 1.0 - Math.sqrt(2) * this.params.champer;
        const plane = new THREE.PlaneGeometry(width, width).translate(
            0,
            0,
            0.5
        );
        const halfPi = Math.PI / 2;
        const geoms = [];

        geoms[Sides.Front] = plane.clone().rotateX(halfPi);
        geoms[Sides.Back] = plane
            .clone()
            .rotateX(-halfPi)
            .rotateY(Math.PI);
        geoms[Sides.Left] = plane
            .clone()
            .rotateY(-halfPi)
            .rotateX(halfPi);
        geoms[Sides.Right] = plane
            .clone()
            .rotateY(halfPi)
            .rotateX(halfPi);
        geoms[Sides.Top] = plane.clone();
        geoms[Sides.Bottom] = plane.clone().rotateX(-Math.PI);

        geoms.forEach((geom, i) => {
            const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
            mesh.userData.sides = i;
            this.cubeMesh.add(mesh);
        });
    }

    createEdgeFacets() {
        // it's math: the projection of the champer on the plane is champer / sqrt(2)
        // (Pythagoras), reduce from both side and you get:
        const width = this.params.champer;
        const height = 1.0 - Math.sqrt(2) * this.params.champer;
        const plane = new THREE.PlaneGeometry(width, height);
        const mat = new THREE.MeshBasicMaterial({
            color: this.params.edgeColor
        });
        const piBy2 = Math.PI / 2;
        const piBy4 = Math.PI / 4;
        const geoms = [];
        const offset: number = Math.sqrt(2) / 2 - this.params.champer / 2;
        plane.translate(0, 0, offset);

        // side edges
        geoms[Sides.Front | Sides.Right] = plane
            .clone()
            .rotateX(piBy2)
            .rotateZ(piBy4);
        geoms[Sides.Right | Sides.Back] = geoms[Sides.Front | Sides.Right]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Back | Sides.Left] = geoms[Sides.Right | Sides.Back]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Left | Sides.Front] = geoms[Sides.Back | Sides.Left]
            .clone()
            .rotateZ(piBy2);

        // top edges
        geoms[Sides.Top | Sides.Right] = plane.clone().rotateY(piBy4);
        geoms[Sides.Top | Sides.Back] = geoms[Sides.Top | Sides.Right]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Top | Sides.Left] = geoms[Sides.Top | Sides.Back]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Top | Sides.Front] = geoms[Sides.Top | Sides.Left]
            .clone()
            .rotateZ(piBy2);

        // botom edges
        geoms[Sides.Bottom | Sides.Right] = plane
            .clone()
            .rotateY(piBy4 + piBy2);
        geoms[Sides.Bottom | Sides.Back] = geoms[Sides.Bottom | Sides.Right]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Bottom | Sides.Left] = geoms[Sides.Bottom | Sides.Back]
            .clone()
            .rotateZ(piBy2);
        geoms[Sides.Bottom | Sides.Front] = geoms[Sides.Bottom | Sides.Left]
            .clone()
            .rotateZ(piBy2);

        geoms.forEach((geom, i) => {
            const sideMat = mat.clone();
            const mesh = new THREE.Mesh(geom, sideMat);
            mesh.userData.sides = i;
            this.cubeMesh.add(mesh);

            // create wireframe
            const border = new THREE.Geometry();
            border.vertices.push(geom.vertices[0]);
            border.vertices.push(geom.vertices[1]);
            border.vertices.push(geom.vertices[3]);
            border.vertices.push(geom.vertices[2]);
            border.vertices.push(geom.vertices[0]);

            const lineMat = new THREE.LineBasicMaterial({ color: "black" }); // TODO make param
            const line = new THREE.Line(border, lineMat);
            mesh.add(line); // the hierarchy is important for ray casting
        });
    }

    getClosesVertexOfPlaneMesh(mesh: THREE.Mesh, vec: Vector3): Vector3 {
        const geom: THREE.PlaneGeometry = mesh.geometry as THREE.PlaneGeometry;
        let closest: Vector3 = geom.vertices[0];
        let bestDist = closest.distanceTo(vec);
        for (let i = 1; i < geom.vertices.length; i++) {
            const dist = geom.vertices[i].distanceTo(vec);
            if (dist < bestDist) {
                bestDist = dist;
                closest = geom.vertices[i];
            }
        }
        return closest;
    }

    getTriangleOfSides(
        a: Sides,
        b: Sides,
        c: Sides,
        corner: Vector3
    ): THREE.Triangle {
        return new THREE.Triangle(
            this.getClosesVertexOfPlaneMesh(this.getMeshOfSide(a), corner),
            this.getClosesVertexOfPlaneMesh(this.getMeshOfSide(b), corner),
            this.getClosesVertexOfPlaneMesh(this.getMeshOfSide(c), corner)
        );
    }

    createCornerMesh(
        a: Sides,
        b: Sides,
        c: Sides,
        corner: Vector3
    ): THREE.Mesh {
        const geom = new THREE.Geometry();
        const triangle = this.getTriangleOfSides(a, b, c, corner);
        geom.vertices.push(triangle.a);
        geom.vertices.push(triangle.b);
        geom.vertices.push(triangle.c);
        geom.faces.push(new THREE.Face3(0, 1, 2));
        const mat = new THREE.MeshBasicMaterial({
            color: this.params.vertexColor
        });
        geom.computeFaceNormals();
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData.sides = a | b | c;
        return mesh;
    }

    createCornerFacets() {
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Left,
                Sides.Front,
                Sides.Top,
                new Vector3(-1, -1, 1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Front,
                Sides.Right,
                Sides.Top,
                new Vector3(1, -1, 1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Right,
                Sides.Back,
                Sides.Top,
                new Vector3(1, 1, 1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Back,
                Sides.Left,
                Sides.Top,
                new Vector3(-1, 1, 1)
            )
        );

        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Front,
                Sides.Left,
                Sides.Bottom,
                new Vector3(-1, -1, -1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Right,
                Sides.Front,
                Sides.Bottom,
                new Vector3(1, -1, -1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Back,
                Sides.Right,
                Sides.Bottom,
                new Vector3(1, 1, -1)
            )
        );
        this.cubeMesh.add(
            this.createCornerMesh(
                Sides.Left,
                Sides.Back,
                Sides.Bottom,
                new Vector3(-1, 1, -1)
            )
        );
    }

    getMeshOfSide(side: Sides): THREE.Mesh {
        return this.cubeMesh.children.find(
            m => m.userData.sides == side
        ) as THREE.Mesh;
    }

    createLabels() {
        const sides = [
            Sides.Front,
            Sides.Back,
            Sides.Left,
            Sides.Right,
            Sides.Top,
            Sides.Bottom
        ];
        const canvasSize = 256; // textures need 2^N, N=7
        let fontSize = 72;

        {
            // find common font size
            const longestString = Sides[Sides.Bottom];
            const canvas = document.createElement("canvas");
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext("2d");
            if (ctx == null) return;

            ctx.font = `bold ${fontSize}px Arial`;
            const pixels = ctx.measureText(longestString);
            const ratio = canvasSize / pixels.width;
            fontSize = Math.round(fontSize * ratio * 0.9); // 90% for padding
        }

        for (const i in sides) {
            const side = sides[i];
            const str = Sides[side];

            const canvas = document.createElement("canvas");
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext("2d");

            if (ctx == null) return;

            ctx.fillStyle = `#${this.params.faceColor.toString(16)}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.fillText(str, canvas.width / 2, canvas.height / 2);

            const mesh = this.getMeshOfSide(side);
            const mat = mesh.material as THREE.MeshBasicMaterial;
            mat.map = new THREE.CanvasTexture(canvas);
        }
    }

    render() {
        const userQuat = this.params.camera.quaternion;
        const localQuat = this.localCamera.quaternion;
        const changed = !userQuat.equals(localQuat);

        if (changed) {
            const vec = this.localCamera.up.clone().multiplyScalar(this.radius);

            vec.applyQuaternion(userQuat);
            this.localCamera.position.copy(vec);
            this.localCamera.setRotationFromQuaternion(userQuat);
            this.renderer.render(this.scene, this.localCamera);
        }

        /*setTimeout(() => {
            requestAnimationFrame(() => this.render());
        }, 1000 / 60);*/
    }
}
