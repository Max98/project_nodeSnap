import myLogger from "electron-log";

import {
    EditorNode,
    EditorBeam,
    EditorTruckData
} from "../TruckEditorInterfaces";

import TruckEditorRenderer from "../TruckEditorRenderer";
import TruckEditorManager from "../TruckEditorManagaer";
import Utils from "../Utils";

/**
 * TODO: maybe a class for this?
 */
import { useToast } from "vue-toastification";
import { Vector3 } from "three";
import Editor from "../Common/EditorClass";

interface HistorySystem {
    fn: string;
    data: string;
}

export default class RoRTruckEditor extends Editor {
    private logger: myLogger.LogFunctions;

    private renderInstance: TruckEditorRenderer;

    private HistorySystem: HistorySystem[] = [];

    private truckData: EditorTruckData;

    constructor() {
        super();
        this.logger = myLogger.default.scope("TruckEditor");
        this.logger.info("init");

        this.truckData = {
            nodes: [],
            beams: [],
            groups: []
        };

        this.renderInstance = TruckEditorManager.getInstance().getRendererObj();
    }

    public reset() {
        this.truckData = {
            nodes: [],
            beams: [],
            groups: []
        };
    }

    public getData() {
        return this.truckData;
    }

    public fetchData() {
        this.truckData = TruckEditorManager.getInstance()
            .getStoreObj()
            .getEditorData();
    }

    /**
     * load truck data
     */
    public loadTruckData() {
        this.renderInstance.getSceneManager().reset();

        //Fetch the data again
        this.fetchData();

        this.logger.log("loading data..");

        for (let i = 0, n = this.truckData.nodes.length; i < n; i++) {
            const currNode = this.truckData.nodes[i];

            this.renderInstance
                .getSceneManager()
                .getCurrSceneController()
                .addNodeToScene(Utils.convertNodeToScene(currNode));
        }

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .prepareNodes();

        for (let i = 0, n = this.truckData.beams.length; i < n; i++) {
            const currBeam = this.truckData.beams[i];

            this.renderInstance
                .getSceneManager()
                .getCurrSceneController()
                .addBeamToScene(currBeam.node1, currBeam.node2);
        }

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .postCalc();
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
            this.logger.error("Failed to add new node: overlap detected.");
            return;
        }

        const nodeId = this.getLastNodeId() + 1;
        const lastGrpId = this.getLastGroupId("node");

        const currNode: EditorNode = {
            grp_id: lastGrpId,

            id: nodeId,
            name: nodeId.toString(),
            x: position.x,
            y: position.y,
            z: position.z,
            options: "",

            isVisible: true
        };

        const historyData: HistorySystem = {
            fn: "addNode",
            data: "index:" + nodeId
        };

        this.HistorySystem.unshift(historyData);

        this.truckData.nodes.push(currNode);

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .addNodeToScene(Utils.convertNodeToScene(currNode));
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
                this.renderInstance
                    .getSceneManager()
                    .getCurrSceneController()
                    .moveNodeSprite(id, {
                        x: position.x,
                        y: position.y,
                        z: position.z
                    });
            }

            this.renderInstance
                .getSceneManager()
                .getCurrSceneController()
                .buildBeamLines();
            this.sendUpdate();
        }
    }

    /**
     * remove a specific node without updating all the nodes after it
     * @param id
     */
    private removeNodeLoop(id: number) {
        this.truckData.nodes = this.truckData.nodes.filter(el => el.id != id);

        this.truckData.beams = this.truckData.beams.filter(
            el => el.node1 != id && el.node2 != id //thanks only_a_ptr ;)
        );
    }

    /**
     * remove a specific node and update everything after it
     * @param id nodeId
     */
    public removeNode(id: number) {
        this.removeNodeLoop(id);

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
        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .setNodeVisibility(id, state);
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

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .moveNodeSprite(currNode.id, {
                x: currNode.x,
                y: currNode.y,
                z: currNode.z
            });

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
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
            this.logger.error("Failed to add new beam: overlap detected.");
            return;
        }

        if (beam.node1 == beam.node2) {
            useToast().error(
                "Failed to add new beam: zero-length beam detected."
            );
            this.logger.error(
                "Failed to add new beam: zero-length beam detected."
            );
            return;
        }

        this.truckData.beams.push({
            node1: beam.node1,
            node2: beam.node2,
            id: beamId,
            isVisible: true,

            grp_id: lastGrpId,

            options: "v" //TODO: set this from editor config
        });

        const historyData: HistorySystem = {
            fn: "addBeam",
            data: "index:" + beamId
        };

        this.HistorySystem.unshift(historyData);

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .addBeamToScene(beam.node1, beam.node2);
        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
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
            .getSceneManager()
            .getCurrSceneController()
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

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
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
     * Remove a specific group
     * @param grpId
     * @param destroy deletes everything inside the group
     */
    public removeGrp(grpId: number, destroy = false) {
        this.truckData.groups = this.truckData.groups.filter(
            currGrp => currGrp.grp_id != grpId
        );

        this.truckData.nodes
            .filter(currNode => currNode.grp_id == grpId)
            .forEach(currNode => {
                currNode.grp_id = this.getLastGroupId("node");
            });

        this.truckData.beams
            .filter(currBeam => currBeam.grp_id == grpId)
            .forEach(currBeam => {
                currBeam.grp_id = this.getLastGroupId("beam");
            });

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
                                        .getSceneManager()
                                        .getCurrSceneController()
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
        const nodesArray: EditorNode[] = JSON.parse(
            JSON.stringify(this.truckData.nodes.filter(el => el.grp_id == id))
        );

        //nodes are mandatory, not the same for beams
        if (nodesArray.length == 0) {
            useToast().error("Failed to duplicate!");
            return;
        }

        const beamsArray: EditorBeam[] = [];

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

            if (node1 != -1 && node2 != -1) {
                beamsArray.push(JSON.parse(JSON.stringify(currBeam)));
            }
        });

        let nodeIndex = this.getLastNodeId() + 1;
        let beamIndex = this.getLastBeamId() + 1;

        //for ctrl+z
        const addedNodesIndex: number[] = [];

        /**
         * Type 0 => offset
         * Type 1 => Mirror
         * Type 2 => Non flipping mirror (Removed 28-01-2020)
         */
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

            const dupNodesArray = [...nodesArray];

            /**
             * The way it works here:
             * 1/Make a copy of the n/b
             * 2/move it with the offset
             * 3/const c has new nodes id => assign to copied beams using the current node id (which is the old id)
             * 4/assign new nodes id to nodes
             * 5/paste
             */

            for (let n = 0; n < times; n++) {
                const nodesBeamsChangeEx: {
                    old: number;
                    new: number;
                }[] = [];
                const nodesArray2: EditorNode[] = [];

                const beamsArray2: EditorBeam[] = JSON.parse(
                    JSON.stringify(beamsArray)
                );

                nodeIndex = this.getLastNodeId() + 1;
                beamIndex = this.getLastBeamId() + 1;

                for (let i = 0; i < dupNodesArray.length; i++) {
                    const currNode = { ...dupNodesArray[i] };

                    switch (axis) {
                        case "x":
                            currNode.x = currNode.x + offset * (n + 1);
                            break;
                        case "y":
                            currNode.y = currNode.y + offset * (n + 1);
                            break;
                        case "z":
                            currNode.z = currNode.z + offset * (n + 1);
                            break;

                        default:
                            break;
                    }

                    const toDelete = this.truckData.nodes.filter(
                        el =>
                            el.x == currNode.x &&
                            el.y == currNode.y &&
                            el.z == currNode.z
                    );

                    if (toDelete.length != 0) {
                        nodesBeamsChangeEx.push({
                            old: currNode.id,
                            new: toDelete[0].id
                        });
                    } else {
                        nodesArray2.push({ ...currNode });
                    }
                }

                for (let i = 0; i < nodesArray2.length; i++) {
                    const currNode = nodesArray2[i];

                    const newNodeId = i + nodeIndex;

                    beamsArray2.forEach(currBeam => {
                        if (currBeam.node1 == currNode.id) {
                            currBeam.node1 = newNodeId;
                        }
                    });

                    beamsArray2.forEach(currBeam => {
                        if (currBeam.node2 == currNode.id) {
                            currBeam.node2 = newNodeId;
                        }
                    });

                    currNode.id = newNodeId;

                    currNode.name = currNode.id.toString();
                    currNode.grp_id = this.getLastGroupId("node");

                    this.truckData.nodes.push(currNode);
                    addedNodesIndex.push(currNode.id);
                    this.renderInstance
                        .getSceneManager()
                        .getCurrSceneController()
                        .addNodeToScene(Utils.convertNodeToScene(currNode));
                }

                for (let i = 0; i < nodesBeamsChangeEx.length; i++) {
                    const nodesData = nodesBeamsChangeEx[i];

                    beamsArray2.forEach(currBeam => {
                        /**
                         * Find the beam
                         */
                        if (currBeam.node1 == nodesData.old) {
                            currBeam.node1 = nodesData.new;
                        } else if (currBeam.node2 == nodesData.old) {
                            currBeam.node2 = nodesData.new;
                        }
                    });
                }

                for (let i = 0; i < beamsArray2.length; i++) {
                    const currBeam = beamsArray2[i];

                    currBeam.id = i + beamIndex;
                    currBeam.grp_id = this.getLastGroupId("beam");

                    this.truckData.beams.push(currBeam);
                    this.renderInstance
                        .getSceneManager()
                        .getCurrSceneController()
                        .addBeamToScene(currBeam.node1, currBeam.node2);
                }
            }
        } else if (type == 1) {
            this.addGrp(-1, newGrpTitle, "node");
            this.addGrp(-1, newGrpTitle, "beam");

            const dupNodesArray = [...nodesArray];
            const nodesBeamsChangeEx: {
                old: number;
                new: number;
            }[] = [];
            const nodesArray2: EditorNode[] = [];

            for (let i = 0; i < dupNodesArray.length; i++) {
                const currNode = { ...dupNodesArray[i] };

                switch (axis) {
                    case "x":
                        currNode.y = -currNode.y;
                        break;

                    case "y":
                        currNode.x = -currNode.x;
                        break;

                    case "z":
                        currNode.z = -currNode.z;
                        break;

                    default:
                        break;
                }

                const toDelete = this.truckData.nodes.filter(
                    el =>
                        el.x == currNode.x &&
                        el.y == currNode.y &&
                        el.z == currNode.z
                );

                if (toDelete.length != 0) {
                    nodesBeamsChangeEx.push({
                        old: currNode.id,
                        new: toDelete[0].id
                    });
                } else {
                    nodesArray2.push({ ...currNode });
                }
            }

            for (let i = 0; i < nodesArray2.length; i++) {
                const currNode = nodesArray2[i];

                const newNodeId = i + nodeIndex;

                beamsArray.forEach(currBeam => {
                    if (currBeam.node1 == currNode.id) {
                        currBeam.node1 = newNodeId;
                    }
                });

                beamsArray.forEach(currBeam => {
                    if (currBeam.node2 == currNode.id) {
                        currBeam.node2 = newNodeId;
                    }
                });

                currNode.id = newNodeId;
                currNode.name = currNode.id.toString();
                currNode.grp_id = this.getLastGroupId("node");

                this.truckData.nodes.push(currNode);
                addedNodesIndex.push(currNode.id);
                this.renderInstance
                    .getSceneManager()
                    .getCurrSceneController()
                    .addNodeToScene(Utils.convertNodeToScene(currNode));
            }

            for (let i = 0; i < nodesBeamsChangeEx.length; i++) {
                const nodesData = nodesBeamsChangeEx[i];

                beamsArray.forEach(currBeam => {
                    /**
                     * Find the beam
                     */
                    if (currBeam.node1 == nodesData.old) {
                        currBeam.node1 = nodesData.new;
                    } else if (currBeam.node2 == nodesData.old) {
                        currBeam.node2 = nodesData.new;
                    }
                });
            }

            for (let i = 0; i < beamsArray.length; i++) {
                const currBeam = beamsArray[i];

                currBeam.id = i + beamIndex;
                currBeam.grp_id = this.getLastGroupId("beam");

                this.truckData.beams.push(currBeam);
                this.renderInstance
                    .getSceneManager()
                    .getCurrSceneController()
                    .addBeamToScene(currBeam.node1, currBeam.node2);
            }
        }

        let str = "";
        addedNodesIndex.forEach(el => {
            str += el.toString() + "|";
        });

        const historyData: HistorySystem = {
            fn: "dupFunc",
            data: str
        };

        this.HistorySystem.unshift(historyData);

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
        this.sendUpdate();
    }

    duplicateVisible(
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ) {
        //for some reasons ... and object.assign did not work here
        const nodesArray: EditorNode[] = JSON.parse(
            JSON.stringify(
                this.truckData.nodes.filter(el => el.isVisible == true)
            )
        );

        //nodes are mandatory, not the same for beams
        if (nodesArray.length == 0) {
            useToast().error("Failed to duplicate!");
            return;
        }

        const beamsArray: EditorBeam[] = [];

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

            if (node1 != -1 && node2 != -1) {
                beamsArray.push(JSON.parse(JSON.stringify(currBeam)));
            }
        });

        const nodeIndex = this.getLastNodeId() + 1;
        const beamIndex = this.getLastBeamId() + 1;

        //for ctrl+z
        const addedNodesIndex: number[] = [];

        const dupNodesArray = [...nodesArray];
        const nodesBeamsChangeEx: {
            old: number;
            new: number;
        }[] = [];
        const nodesArray2: EditorNode[] = [];

        for (let i = 0; i < dupNodesArray.length; i++) {
            const currNode = { ...dupNodesArray[i] };

            switch (axis) {
                case "x":
                    currNode.y = -currNode.y;
                    break;

                case "y":
                    currNode.x = -currNode.x;
                    break;

                case "z":
                    currNode.z = -currNode.z;
                    break;

                default:
                    break;
            }

            const toDelete = this.truckData.nodes.filter(
                el =>
                    el.x == currNode.x &&
                    el.y == currNode.y &&
                    el.z == currNode.z
            );

            if (toDelete.length != 0) {
                nodesBeamsChangeEx.push({
                    old: currNode.id,
                    new: toDelete[0].id
                });
            } else {
                nodesArray2.push({ ...currNode });
            }
        }

        let lastGrpId = -1;

        for (let i = 0; i < nodesArray2.length; i++) {
            const currNode = nodesArray2[i];

            const newNodeId = i + nodeIndex;

            beamsArray.forEach(currBeam => {
                if (currBeam.node1 == currNode.id) {
                    currBeam.node1 = newNodeId;
                }
            });

            beamsArray.forEach(currBeam => {
                if (currBeam.node2 == currNode.id) {
                    currBeam.node2 = newNodeId;
                }
            });

            currNode.id = newNodeId;
            currNode.name = currNode.id.toString();

            if (currNode.grp_id != lastGrpId) {
                this.addGrp(
                    -1,
                    this.truckData.groups.find(
                        el => el.grp_id == currNode.grp_id
                    )!.title + newGrpTitle,
                    "node"
                );
                lastGrpId = currNode.grp_id;
            }
            currNode.grp_id = this.getLastGroupId("node");

            this.truckData.nodes.push(currNode);
            addedNodesIndex.push(currNode.id);
            this.renderInstance
                .getSceneManager()
                .getCurrSceneController()
                .addNodeToScene(Utils.convertNodeToScene(currNode));
        }

        for (let i = 0; i < nodesBeamsChangeEx.length; i++) {
            const nodesData = nodesBeamsChangeEx[i];

            beamsArray.forEach(currBeam => {
                /**
                 * Find the beam
                 */
                if (currBeam.node1 == nodesData.old) {
                    currBeam.node1 = nodesData.new;
                } else if (currBeam.node2 == nodesData.old) {
                    currBeam.node2 = nodesData.new;
                }
            });
        }

        lastGrpId = -1;
        for (let i = 0; i < beamsArray.length; i++) {
            const currBeam = beamsArray[i];

            currBeam.id = i + beamIndex;
            if (currBeam.grp_id != lastGrpId) {
                this.addGrp(
                    -1,
                    this.truckData.groups.find(
                        el => el.grp_id == currBeam.grp_id
                    )!.title + newGrpTitle,
                    "beam"
                );
                lastGrpId = currBeam.grp_id;
            }
            currBeam.grp_id = this.getLastGroupId("beam");

            this.truckData.beams.push(currBeam);
            this.renderInstance
                .getSceneManager()
                .getCurrSceneController()
                .addBeamToScene(currBeam.node1, currBeam.node2);
        }
        let str = "";
        addedNodesIndex.forEach(el => {
            str += el.toString() + "|";
        });

        const historyData: HistorySystem = {
            fn: "dupFunc",
            data: str
        };

        this.HistorySystem.unshift(historyData);

        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .buildBeamLines();
        this.sendUpdate();
    }

    /**
     * change a group's visibility
     * @param id group id
     * @param state visibility
     */
    public setGroupVisibility(id: number, state: boolean) {
        this.renderInstance
            .getSceneManager()
            .getCurrSceneController()
            .setGroupVisibility(id, state);
        this.truckData.groups!.find(el => el.grp_id == id)!.isVisible = state;

        this.truckData.nodes
            .filter(el => el.grp_id == id)
            .forEach(el => {
                el.isVisible = state;
            });
    }

    /**
     * Scale the whole n/b
     * @param factor
     */
    public scaleAll(factor: number, isHistory = false) {
        if (factor == 0) {
            useToast().warning("Scaling factor cannot be equal to 0.");
            return;
        }

        this.truckData.nodes.forEach(currNode => {
            currNode.x *= factor;
            currNode.y *= factor;
            currNode.z *= factor;
        });

        if (!isHistory) {
            const historyData: HistorySystem = {
                fn: "scale",
                data: factor.toString()
            };

            this.HistorySystem.unshift(historyData);
        }

        this.renderInstance.getSceneManager().reset();
        this.loadTruckData();
        this.sendUpdate();
    }

    /**
     * Move the whole n/b
     * @param offset
     */
    public translateAll(
        offset: { x: number; y: number; z: number },
        isHistory = false
    ) {
        this.truckData.nodes.forEach(currNode => {
            currNode.x += offset.x;
            currNode.y += offset.y;
            currNode.z += offset.z;
        });

        if (!isHistory) {
            const historyData: HistorySystem = {
                fn: "translate",
                data:
                    offset.x.toString() +
                    "|" +
                    offset.y.toString() +
                    "|" +
                    offset.z.toString()
            };

            this.HistorySystem.unshift(historyData);
        }

        this.renderInstance.getSceneManager().reset();
        this.loadTruckData();
        this.sendUpdate();
    }

    /**
     * Rotate the whole n/b
     * @param rot in degree
     * @param axis axis
     */
    public rotateAll(rot: number, axis: string, isHistory = false) {
        const rotRad = (rot * Math.PI) / 180;

        const vectorArray: Vector3[] = [];

        this.truckData.nodes.forEach(currNode => {
            vectorArray.push(new Vector3(currNode.x, currNode.y, currNode.z));
        });

        let axisVec: Vector3;

        switch (axis) {
            case "x":
                axisVec = new Vector3(1, 0, 0);
                break;

            case "y":
                axisVec = new Vector3(0, 1, 0);
                break;

            case "z":
                axisVec = new Vector3(0, 0, 1);
                break;

            default:
                break;
        }

        let i = 0;
        vectorArray.forEach(vec => {
            vec.applyAxisAngle(axisVec, rotRad);
            this.truckData.nodes[i].x = vec.x;
            this.truckData.nodes[i].y = vec.y;
            this.truckData.nodes[i].z = vec.z;
            i++;
        });

        if (!isHistory) {
            const historyData: HistorySystem = {
                fn: "rotate",
                data: rot.toString() + "|" + axis
            };

            this.HistorySystem.unshift(historyData);
        }

        this.renderInstance.getSceneManager().reset();
        this.loadTruckData();
        this.sendUpdate();
    }

    /**
     * Utils
     */

    /**
     * Update the UI
     */
    private async sendUpdate() {
        //TODO: this should happen here
        //Too much performance cost
        TruckEditorManager.getInstance()
            .getStoreObj()
            .setEditorData(this.truckData);
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
     */
    public requestUndo() {
        if (this.HistorySystem.length == 0) return;

        const data: HistorySystem = this.HistorySystem[0];

        switch (data.fn) {
            case "addNode":
                this.removeNode(parseInt(data.data.split(":")[1]));
                this.HistorySystem.shift();
                break;
            case "addBeam":
                this.removeBeam(parseInt(data.data.split(":")[1]));
                this.HistorySystem.shift();
                break;
            case "moveNode":
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
            case "dupFunc":
                data.data.split("|").forEach(currNodeId => {
                    if (currNodeId == "") return;
                    this.removeNodeLoop(parseInt(currNodeId));
                });
                this.HistorySystem.shift();
                this.sendUpdate();
                this.loadTruckData();
                break;
            case "scale":
                this.scaleAll(1 / parseFloat(data.data), true);
                this.HistorySystem.shift();
                break;
            case "translate":
                this.translateAll(
                    {
                        x: -parseFloat(data.data.split("|")[0]),
                        y: -parseFloat(data.data.split("|")[1]),
                        z: -parseFloat(data.data.split("|")[2])
                    },
                    true
                );
                this.HistorySystem.shift();
                break;
            case "rotate":
                this.rotateAll(
                    -parseFloat(data.data.split("|")[0]),
                    data.data.split("|")[1],
                    true
                );
                this.HistorySystem.shift();
                break;
        }
    }
}
