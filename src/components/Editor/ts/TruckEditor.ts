import myLogger from "electron-log";
import store from "@/store/index";
import {
    TruckFileInterface,
    EditorNode,
    nodeType,
    EditorBeam
} from "./TruckFileInterfaces";
import TruckEditorRenderer from "./TruckEditorRenderer";
import TruckEditorManager from "./TruckEditorManagaer";

/**
 * TODO: maybe a class for this?
 */
import { useToast } from "vue-toastification";

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

    public getData() {
        return this.truckData;
    }

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
     * @param id item id
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

                    if (currNode == undefined) return;
                    const newGrpId = this.getLastGroupId() + 1;

                    //We copy the data to a new reference
                    const exGrpId = JSON.parse(JSON.stringify(currNode.grp_id));

                    this.truckData.groups.push({
                        grp_id: newGrpId,
                        title: title,
                        type: "node",
                        isVisible: true
                    });

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

                break;

            case "beam":
                {
                    const currBeam = this.truckData.beams.find(
                        el => el.id == id
                    );

                    if (currBeam == undefined) return;
                    const newGrpId = this.getLastGroupId() + 1;

                    //We copy the data to a new reference
                    const exGrpId = JSON.parse(JSON.stringify(currBeam.grp_id));

                    this.truckData.groups.push({
                        grp_id: newGrpId,
                        title: title,
                        type: "beam",
                        isVisible: true
                    });

                    this.truckData.beams.forEach(el => {
                        if (el.id >= id) {
                            if (el.grp_id == exGrpId) {
                                el.grp_id = newGrpId;
                            }
                        }
                    });
                }

                break;

            default:
                break;
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
