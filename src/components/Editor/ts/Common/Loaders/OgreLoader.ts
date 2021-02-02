import * as THREE from "three";
import fs from "fs";
import xml2js from "xml2js";

export default class OgreLoader {
    private mesh: THREE.Mesh | undefined;

    constructor(filePath: string) {
        const dataURI = fs.readFileSync(filePath, "utf8");

        const parser = new xml2js.Parser();
        parser.parseString(dataURI, (err: any, result: any) => {
            console.dir(result);
            this.prepare(result);
        });
    }

    public getMesh(): THREE.Mesh | undefined {
        return this.mesh;
    }

    private prepare(obj: any) {
        const geometry = new THREE.Geometry();

        if (obj.mesh.sharedgeometry) {
            for (
                let index = 0;
                index <
                obj.mesh.sharedgeometry[0].vertexbuffer[0].vertex.length;
                index++
            ) {
                const element =
                    obj.mesh.sharedgeometry[0].vertexbuffer[0].vertex[index];

                geometry.vertices.push(
                    new THREE.Vector3(
                        element.position[0].$.x,
                        element.position[0].$.y,
                        element.position[0].$.z
                    )
                );
            }
        }

        if (obj.mesh.submeshes[0].submesh[0].geometry) {
            if (
                obj.mesh.submeshes[0].submesh[0].geometry[0].vertexbuffer[0]
                    .vertex
            ) {
                for (
                    let index = 0;
                    index <
                    obj.mesh.submeshes[0].submesh[0].geometry[0].vertexbuffer[0]
                        .vertex.length;
                    index++
                ) {
                    const element =
                        obj.mesh.submeshes[0].submesh[0].geometry[0]
                            .vertexbuffer[0].vertex[index];

                    geometry.vertices.push(
                        new THREE.Vector3(
                            element.position[0].$.x,
                            element.position[0].$.y,
                            element.position[0].$.z
                        )
                    );
                }
            }
        }

        if (obj.mesh.submeshes[0].submesh) {
            for (
                let index = 0;
                index < obj.mesh.submeshes[0].submesh.length;
                index++
            ) {
                const element = obj.mesh.submeshes[0].submesh[index];
                for (
                    let index = 0;
                    index < element.faces[0].face.length;
                    index++
                ) {
                    const el2 = element.faces[0].face[index];

                    geometry.faces.push(
                        new THREE.Face3(el2.$.v1, el2.$.v2, el2.$.v3)
                    );
                }
            }
        }

        if (geometry.vertices.length == 0) return;

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        /**
         * TODO: Load texture?
         */
        const material = new THREE.MeshBasicMaterial({
            color: "white"
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(60, 60, 60); //TODO: nodesPosRenderScale
        this.mesh.rotateX(Math.PI * 0.5);
    }
}
