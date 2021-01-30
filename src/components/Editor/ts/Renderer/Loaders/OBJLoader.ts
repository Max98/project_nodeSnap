import * as THREE from "three";
import fs from "fs";
import xml2js from "xml2js";
import { OBJLoader2 } from "three/examples/jsm/loaders/OBJLoader2";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";

export default class OBJLoader {
    private mesh: THREE.Mesh | undefined;

    constructor(filePath: string) {
        const loader = new OBJLoader2();
        const dataURI = fs.readFileSync(filePath, "utf8");
        const models = loader.parse(dataURI).children as THREE.Mesh[];

        const buf: THREE.BufferGeometry[] = [];

        models.forEach(el => {
            el.updateMatrix();
            buf.push(el.geometry as THREE.BufferGeometry);
        });

        this.prepare(BufferGeometryUtils.mergeBufferGeometries(buf));
    }

    public getMesh(): THREE.Mesh | undefined {
        return this.mesh;
    }

    private prepare(obj: THREE.BufferGeometry) {
        const material = new THREE.MeshBasicMaterial({
            color: "white"
        });

        this.mesh = new THREE.Mesh(obj, material);
        this.mesh.scale.set(60, 60, 60); //TODO: nodesPosRenderScale
        this.mesh.rotateX(Math.PI * 0.5);
    }
}
