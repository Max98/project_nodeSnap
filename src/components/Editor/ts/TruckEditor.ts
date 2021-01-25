import myLogger from "electron-log";
import {
    TruckFileInterface,
    EditorNode,
    nodeType,
    EditorBeam
} from "./TruckFileInterfaces";
import TruckEditorRenderer from "./TruckEditorRenderer";
import TruckEditorManager from "./TruckEditorManagaer";

import * as THREE from "three";

/**
 * TODO: maybe a class for this?
 */
import { useToast } from "vue-toastification";
import { Vector3 } from "three";

interface HistorySystem {
    fn: string;
    data: string;
}

export default class TruckEditor {
    private Log: myLogger.LogFunctions;
    private truckData: TruckFileInterface;

    private renderInstance: TruckEditorRenderer;

    private HistorySystem: HistorySystem[] = [];

    constructor() {
        this.Log = myLogger.default.scope("TruckEditor");
        this.Log.info("init");

        /**
         * Base structure
         */
        this.truckData = {
            title: "",
            globals: {
                cargoMass: 500,
                dryMass: 3000,
                material: "",
                sbd_preset_id: -1,
                snd_preset_id: -1,
                grp_id: -1,
                comment_id: -1
            },
            nodes: [],
            beams: [],
            groups: []
        };

        this.renderInstance = TruckEditorManager.getInstance().getRendererObj();
    }

    /**
     * fetch data
     */
    public loadData(data: TruckFileInterface) {
        this.truckData = data;
    }

    /**
     * get all truck data
     */
    public getData(): TruckFileInterface {
        return this.truckData;
    }

    /**
     * Reset truck data
     * Warning: deletes everything
     */
    public reset() {
        this.truckData = {
            title: "",
            globals: {
                cargoMass: 500,
                dryMass: 3000,
                material: "",
                sbd_preset_id: -1,
                snd_preset_id: -1,
                grp_id: -1,
                comment_id: -1
            },
            nodes: [],
            beams: [],
            groups: []
        };
    }

    /**
     * Init a new file
     * @param title truck title
     * @param dryMass
     * @param cargoMass
     */
    public create(title: string, dryMass: number, cargoMass: number) {
        this.reset();
        this.truckData.title = title;
        this.truckData.globals.dryMass = dryMass;
        this.truckData.globals.cargoMass = cargoMass;
    }

    /**
     * load truck data
     */
    public loadTruckData() {
        this.renderInstance.getSceneController().reset();

        //Fetch the data again
        //this.truckData = store.getters.getTruckData;

        console.log(this.truckData);

        for (let i = 0, n = this.truckData.nodes.length; i < n; i++) {
            const currNode = this.truckData.nodes[i];

            this.renderInstance.getSceneController().addNodeToScene(currNode);
        }

        this.renderInstance.getSceneController().prepareNodes();

        for (let i = 0, n = this.truckData.beams.length; i < n; i++) {
            const currBeam = this.truckData.beams[i];

            this.renderInstance
                .getSceneController()
                .addBeamToScene(currBeam.node1, currBeam.node2);
        }

        this.renderInstance.getSceneController().buildBeamLines();
        this.renderInstance.getSceneController().postCalc();
        this.renderInstance.getSceneController().loadConfig();
    }

    /**
     * Add a new node
     * @param nodeData node data
     */
    public addNode(position: THREE.Vector3) {
        //Check for overlaping node
        const overlap =
            this.truckData.nodes.filter(
                el =>
                    el.x == position.x &&
                    el.y == position.y &&
                    el.z == position.z
            ).length != 0;

        if (overlap) {
            useToast().error("Failed to add new node: overlap detected.");
            this.Log.error("Failed to add new node: overlap detected.");
            return;
        }

        const nodeId = this.getLastNodeId() + 1;
        const lastGrpId = this.getLastGroupId("node");

        const currNode: EditorNode = {
            sbd_preset_id: -1,
            snd_preset_id: -1,
            grp_id: lastGrpId,
            comment_id: -1,

            id: nodeId,
            name: nodeId.toString(),
            x: position.x,
            y: position.y,
            z: position.z,
            type: nodeType.DEFAULT,
            isVisible: true
        };

        const historyData: HistorySystem = {
            fn: "addNode",
            data: "index:" + nodeId
        };

        this.HistorySystem.unshift(historyData);

        this.truckData.nodes.push(currNode);

        this.renderInstance.getSceneController().addNodeToScene(currNode);
        this.sendUpdate();
    }

    /**
     * move a specific node
     * @param id node id
     * @param position node new position
     */
    public moveNode(
        id: number,
        position: { x: number; y: number; z: number },
        isUndo?: boolean
    ) {
        const currNode: EditorNode | undefined = this.truckData.nodes.find(
            el => el.id == id
        );

        if (currNode != undefined) {
            if (!isUndo) {
                const hist: HistorySystem = {
                    fn: "moveNode",
                    data:
                        id +
                        "|" +
                        currNode.x +
                        "|" +
                        currNode.y +
                        "|" +
                        currNode.z
                };

                this.HistorySystem.unshift(hist);
            }

            currNode.x = position.x;
            currNode.y = position.y;
            currNode.z = position.z;

            if (isUndo) {
                this.renderInstance.getSceneController().moveNodeSprite(id, {
                    x: position.x,
                    y: position.y,
                    z: position.z
                });
            }

            this.renderInstance.getSceneController().buildBeamLines();
            this.sendUpdate();
        }
    }

    /**
     * remove a specific node
     * @param id nodeId
     */
    public removeNode(id: number) {
        this.truckData.nodes = this.truckData.nodes.filter(el => el.id != id);

        this.truckData.beams = this.truckData.beams.filter(
            el => el.node1 != id && el.node2 != id //thanks only_a_ptr ;)
        );

        for (let i = 0, n = this.truckData.nodes.length; i < n; i++) {
            const currNode = this.truckData.nodes[i];
            if (currNode.id > id) {
                currNode.id -= 1;
            }
        }

        for (let i = 0, n = this.truckData.beams.length; i < n; i++) {
            const currBeam = this.truckData.beams[i];

            if (currBeam.node1 > id) {
                currBeam.node1 -= 1;
            }

            if (currBeam.node2 > id) {
                currBeam.node2 -= 1;
            }
        }

        this.sendUpdate();
        this.loadTruckData();
    }

    /**
     * change a node's visibility
     * @param id node id
     * @param state visibility
     */
    public setNodeVisibility(id: number, state: boolean) {
        this.renderInstance.getSceneController().setNodeVisibility(id, state);
        this.truckData.nodes.find(el => el.id == id)!.isVisible = state;
    }

    /**
     * Set a specific node to specific data
     * @param node
     */
    public setNodeData(node: EditorNode) {
        const currNode = this.truckData.nodes.find(el => el.id == node.id);

        if (currNode == undefined) {
            //case where select last node, then delete the node
            useToast().warning("Could not find node: " + node.id);
            return;
        }

        Object.assign(currNode, node);

        this.renderInstance.getSceneController().moveNodeSprite(currNode.id, {
            x: currNode.x,
            y: currNode.y,
            z: currNode.z
        });

        this.renderInstance.getSceneController().buildBeamLines();
        this.sendUpdate();
    }

    /**
     * add a new beam
     * @param beam beam data
     */
    public addBeam(beam: { node1: number; node2: number }) {
        const beamId = this.getLastBeamId() + 1;
        const lastGrpId = this.getLastGroupId("beam");

        if (
            this.truckData.beams.find(
                el => el.node1 == beam.node1 && el.node2 == beam.node2
            ) ||
            this.truckData.beams.find(
                el => el.node1 == beam.node2 && el.node2 == beam.node1
            )
        ) {
            useToast().error("Failed to add new beam: overlap detected.");
            this.Log.error("Failed to add new beam: overlap detected.");
            return;
        }

        if (beam.node1 == beam.node2) {
            useToast().error(
                "Failed to add new beam: zero-length beam detected."
            );
            this.Log.error(
                "Failed to add new beam: zero-length beam detected."
            );
            return;
        }

        this.truckData.beams.push({
            node1: beam.node1,
            node2: beam.node2,
            id: beamId,
            isVisible: true,

            sbd_preset_id: -1,
            snd_preset_id: -1,
            grp_id: lastGrpId,
            comment_id: -1,
            options: "v" //TODO: set this from editor config
        });

        const historyData: HistorySystem = {
            fn: "addBeam",
            data: "index:" + beamId
        };

        this.HistorySystem.unshift(historyData);

        this.renderInstance
            .getSceneController()
            .addBeamToScene(beam.node1, beam.node2);
        this.renderInstance.getSceneController().buildBeamLines();
        this.sendUpdate();
    }

    /**
     * Remove a beam
     * @param currBeamId beamId
     */
    public removeBeam(currBeamId: number) {
        const currBeam = this.truckData.beams.filter(el => el.id == currBeamId);
        if (currBeam.length == 0) return;

        this.renderInstance
            .getSceneController()
            .removeBeamFromScene(currBeam[0].node1, currBeam[0].node2);

        this.truckData.beams = this.truckData.beams.filter(
            el => el != currBeam[0]
        );

        for (let i = 0, n = this.truckData.beams.length; i < n; i++) {
            const currBeam = this.truckData.beams[i];

            if (currBeam.id > currBeamId) {
                currBeam.id -= 1;
            }
        }

        this.renderInstance.getSceneController().buildBeamLines();
        this.sendUpdate();
    }

    public setBeamData(beam: EditorBeam) {
        const currBeam = this.truckData.beams.find(el => el.id == beam.id);

        if (currBeam == undefined) {
            //case where select last node, then delete the node
            useToast().warning("Could not find node: " + beam.id);
            return;
        }

        Object.assign(currBeam, beam);

        this.sendUpdate();
    }

    /**
     * rename a group
     * @param grpId
     * @param title
     */
    public renameGrp(grpId: number, title: string) {
        if (this.truckData.groups == undefined) return;

        this.truckData.groups.find(el => el.grp_id == grpId)!.title = title;
        this.sendUpdate();
    }

    /**
     * Add a new group to either type ("node" or "beam")
     * @param id item id (-1 to just create a new group)
     * @param title group title
     * @param type "node" or "beam"
     */
    public addGrp(id: number, title: string, type: string) {
        if (this.truckData.groups == undefined) {
            this.truckData.groups = [];
        }

        switch (type) {
            case "node":
                {
                    const currNode = this.truckData.nodes.find(
                        el => el.id == id
                    );

                    const newGrpId = this.getLastGroupId() + 1;

                    this.truckData.groups.push({
                        grp_id: newGrpId,
                        title: title,
                        type: "node",
                        isVisible: true
                    });

                    if (currNode != undefined) {
                        const exGrpId = JSON.parse(
                            JSON.stringify(currNode.grp_id)
                        );
                        this.truckData.nodes.forEach(el => {
                            if (el.id >= id) {
                                if (el.grp_id == exGrpId) {
                                    el.grp_id = newGrpId;
                                    this.renderInstance
                                        .getSceneController()
                                        .updateNodeSpriteGrp(el.id, el.grp_id);
                                }
                            }
                        });
                    }
                }

                break;

            case "beam":
                {
                    const currBeam = this.truckData.beams.find(
                        el => el.id == id
                    );

                    const newGrpId = this.getLastGroupId() + 1;

                    this.truckData.groups.push({
                        grp_id: newGrpId,
                        title: title,
                        type: "beam",
                        isVisible: true
                    });

                    if (currBeam != undefined) {
                        const exGrpId = JSON.parse(
                            JSON.stringify(currBeam.grp_id)
                        );

                        this.truckData.beams.forEach(el => {
                            if (el.id >= id) {
                                if (el.grp_id == exGrpId) {
                                    el.grp_id = newGrpId;
                                }
                            }
                        });
                    }
                }

                break;

            default:
                break;
        }
        this.sendUpdate();
    }

    public duplicateGrp(
        id: number,
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ) {
        //for some reasons ... and object.assign did not work here
        let nodesArray: EditorNode[] = JSON.parse(
            JSON.stringify(this.truckData.nodes.filter(el => el.grp_id == id))
        );

        //nodes are mandatory, not the same for beams
        if (nodesArray.length == 0) {
            useToast().error("Failed to duplicate!");
            return;
        }

        let beamsArray: EditorBeam[] = [];

        /**
         * TODO: i'm pretty sure there is an easier and faster way for this
         */
        this.truckData.beams.forEach(currBeam => {
            let node1 = -1;
            let node2 = -1;

            nodesArray.forEach(currNode => {
                if (
                    currBeam.node1 == currNode.id ||
                    currBeam.node2 == currNode.id
                ) {
                    node1 = currNode.id;
                }
            });

            nodesArray.forEach(currNode => {
                if (
                    (currBeam.node1 == currNode.id ||
                        currBeam.node2 == currNode.id) &&
                    currNode.id != node1
                ) {
                    node2 = currNode.id;
                }
            });

            if (node1 != -1 && node2 != -1)
                beamsArray.push(JSON.parse(JSON.stringify(currBeam)));
        });

        let nodeIndex = this.getLastNodeId() + 1;
        const beamIndex = this.getLastBeamId() + 1;

        if (type == 0) {
            if (times <= 0) {
                useToast().error(
                    "Failed duplicate! number of times cannot be under 1!"
                );
                return;
            }

            if (offset == 0) {
                useToast().warning(
                    "Failed duplicate! offset cannot be equal to zero."
                );
                return;
            }

            for (let n = 0; n < times; n++) {
                nodeIndex = this.getLastNodeId() + 1;
                for (let i = 0; i < nodesArray.length; i++) {
                    const el = nodesArray[i];

                    el.id = i + nodeIndex;
                    el.name = el.id.toString();
                    el.grp_id = this.getLastGroupId("node");

                    console.log(typeof offset);

                    switch (axis) {
                        case "x":
                            el.x = el.x + offset;
                            break;
                        case "y":
                            el.y = el.y + offset;
                            break;
                        case "z":
                            el.z = el.z + offset;
                            break;

                        default:
                            break;
                    }

                    this.truckData.nodes.push(el);
                    this.renderInstance.getSceneController().addNodeToScene(el);
                }
                nodesArray = JSON.parse(JSON.stringify(nodesArray));

                if (beamIndex != 0) {
                    for (let i = 0; i < beamsArray.length; i++) {
                        const el = beamsArray[i];
                        el.node1 = el.node1 + nodesArray.length;
                        el.node2 = el.node2 + nodesArray.length;
                        el.id = i + beamIndex;
                        el.grp_id = this.getLastGroupId("beam");

                        this.truckData.beams.push(el);
                        this.renderInstance
                            .getSceneController()
                            .addBeamToScene(el.node1, el.node2);
                    }
                    this.renderInstance.getSceneController().buildBeamLines();
                    beamsArray = JSON.parse(JSON.stringify(beamsArray));
                }
            }
        } else if (type == 1) {
            this.addGrp(-1, newGrpTitle, "node");
            for (let i = 0; i < nodesArray.length; i++) {
                const el = nodesArray[i];

                el.id = i + nodeIndex;
                el.name = el.id.toString();
                el.grp_id = this.getLastGroupId("node");

                switch (axis) {
                    case "x":
                        el.y = -el.y;
                        break;

                    case "y":
                        el.x = -el.x;
                        break;

                    case "z":
                        el.z = -el.z;
                        break;

                    default:
                        break;
                }

                this.truckData.nodes.push(el);
                this.renderInstance.getSceneController().addNodeToScene(el);
            }
        } else if (type == 2) {
            this.addGrp(-1, newGrpTitle, "node");
            const geometry = new THREE.Geometry();
            nodesArray.forEach(el => {
                geometry.vertices.push(new Vector3(el.x, el.y, el.z));
            });

            const mesh = new THREE.Mesh(geometry);
            const center = new THREE.Vector3();
            mesh.geometry.computeBoundingBox();
            mesh.geometry.boundingBox!.getCenter(center);
            mesh.geometry.center();
            mesh.position.copy(center);

            switch (axis) {
                case "x":
                    mesh.position.y = -mesh.position.y;
                    break;

                case "y":
                    mesh.position.x = -mesh.position.x;
                    break;

                case "z":
                    mesh.position.z = -mesh.position.z;
                    break;

                default:
                    break;
            }

            mesh.updateMatrixWorld();

            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                const currVert = mesh.localToWorld(mesh.geometry.vertices[i]);
                nodesArray[i].id = i + nodeIndex;

                nodesArray[i].x = currVert.x;
                nodesArray[i].y = currVert.y;
                nodesArray[i].z = currVert.z;
                nodesArray[i].grp_id = this.getLastGroupId("node");

                if (
                    this.truckData.nodes.filter(
                        el =>
                            el.x == currVert.x &&
                            el.y == currVert.y &&
                            el.z == currVert.z
                    ).length != 0
                ) {
                    useToast().error("Overlap detected.");
                    return;
                }

                this.truckData.nodes.push(nodesArray[i]);
                this.renderInstance
                    .getSceneController()
                    .addNodeToScene(nodesArray[i]);
            }
        }

        if (type != 0) {
            if (beamIndex != 0) {
                this.addGrp(-1, newGrpTitle, "beam");

                for (let i = 0; i < beamsArray.length; i++) {
                    const el = beamsArray[i];
                    el.node1 = el.node1 + nodeIndex;
                    el.node2 = el.node2 + nodeIndex;
                    el.id = i + beamIndex;
                    el.grp_id = this.getLastGroupId("beam");

                    this.truckData.beams.push(el);
                    this.renderInstance
                        .getSceneController()
                        .addBeamToScene(el.node1, el.node2);
                }
                this.renderInstance.getSceneController().buildBeamLines();
            }
        }

        this.sendUpdate();
    }

    /**
     * change a group's visibility
     * @param id group id
     * @param state visibility
     */
    public setGroupVisibility(id: number, state: boolean) {
        this.renderInstance.getSceneController().setGroupVisibility(id, state);
        this.truckData.groups!.find(el => el.grp_id == id)!.isVisible = state;

        this.truckData.nodes
            .filter(el => el.grp_id == id)
            .forEach(el => {
                el.isVisible = state;
            });
    }

    /**
     * Utils
     */

    /**
     * Update the UI
     */
    private async sendUpdate() {
        //This is a performance hit on large data
        //store.dispatch("setTruckData", this.truckData);
        document.dispatchEvent(new Event("truckDataUpdate"));
    }

    /**
     * Returns last node's id
     */
    private getLastNodeId(): number {
        //Since everything is orderd, we can do this
        return this.truckData.nodes.length - 1;
    }
    /**
     * Returns last beam id
     */
    private getLastBeamId(): number {
        //Since everything is orderd, we can do this
        return this.truckData.beams.length - 1;
    }

    /**
     * returns either all groups last id, nodes groups last id or beam groups last id
     * @param type item type either "node" or "beam"
     */
    private getLastGroupId(type?: string) {
        if (this.truckData.groups == undefined) return -1;

        if (type == undefined) return this.truckData.groups.length - 1;

        const typeGrps = this.truckData.groups.filter(el => el.type == type);

        if (typeGrps.length != 0) {
            return typeGrps[typeGrps.length - 1].grp_id;
        } else {
            return -1;
        }
    }

    /**
     * Undo/Redo
     * Only for nodes and beams
     *
     * addNode
     * removeNode
     * moveNode
     *
     * addBeam
     * removeBeam
     */
    public requestUndo() {
        console.log(this.HistorySystem);

        if (this.HistorySystem.length == 0) return;

        const data: HistorySystem = this.HistorySystem[0];

        switch (data.fn) {
            case "addNode":
                console.log("removing node:" + data.data);
                this.removeNode(parseInt(data.data.split(":")[1]));
                this.HistorySystem.shift();
                break;
            case "addBeam":
                console.log("removing beam:" + data.data);
                this.removeBeam(parseInt(data.data.split(":")[1]));
                this.HistorySystem.shift();
                break;
            case "moveNode":
                console.log("restored node to pos");

                this.moveNode(
                    parseInt(data.data.split("|")[0]),
                    {
                        x: parseFloat(data.data.split("|")[1]),
                        y: parseFloat(data.data.split("|")[2]),
                        z: parseFloat(data.data.split("|")[3])
                    },
                    true
                );

                this.HistorySystem.shift();
                break;
        }
    }
}
