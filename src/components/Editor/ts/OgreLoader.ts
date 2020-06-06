import * as THREE from "three";
import fs from "fs";
import xml2js from "xml2js";
import TruckEditor from "./TruckEditor";

export default class OgreLoader {
    private scene: THREE.Scene;
    private scale: number;
    private mesh!: THREE.LineSegments;
    private truckEditorInstance: TruckEditor;

    constructor(
        file: File,
        scene: THREE.Scene,
        scale: number,
        truckEditorInstance: TruckEditor
    ) {
        this.scene = scene;
        this.scale = scale;
        this.truckEditorInstance = truckEditorInstance;

        console.log("hi");

        console.log(file.path);

        const dataURI = fs.readFileSync(file.path, "utf8");

        const parser = new xml2js.Parser();
        parser.parseString(dataURI, (err: any, result: any) => {
            console.dir(result);
            this.prepare(result);
        });
    }

    prepare(obj: any) {
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

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        //const mesh = new THREE.Mesh(geometry, material);
        //mesh.scale.set(this.scale, this.scale, this.scale);
        //mesh.rotateY(Math.PI * 0.5);

        const material = new THREE.LineBasicMaterial({
            color: "white",
            opacity: 0.2
        });
        material.transparent = true;

        const wireframe = new THREE.WireframeGeometry(geometry);
        this.mesh = new THREE.LineSegments(wireframe, material);
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        this.mesh.rotateY(-Math.PI * 0.5);

        console.log("Done");

        this.scene.add(this.mesh);
        this.truckEditorInstance.requestAllRendersUpdate();
    }
    toggleVisibility() {
        this.mesh.visible = !this.mesh.visible;
        this.truckEditorInstance.requestAllRendersUpdate();
    }
}
