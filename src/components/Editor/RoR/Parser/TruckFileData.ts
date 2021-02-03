/**
 * This is where we store the truck file data
 */
import StoreClass from "../../Common/StoreClass";
import { EditorTruckData } from "../../TruckEditorInterfaces";
import Utils from "../../Utils";
import {
    TruckFileInterface,
    TruckFileNode,
    TruckFileBeam,
    TruckFileGroup
} from "../RoRTruckFileInterfaces";

export default class TruckFileData extends StoreClass {
    private truckData: TruckFileInterface;

    constructor() {
        super();

        this.filePath = "";
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
    }

    public reset() {
        this.filePath = "";

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

    public create(title: string) {
        this.reset();
        this.truckData.title = title;
    }

    public loadData(data: TruckFileInterface) {
        this.truckData = data;
    }

    public getData() {
        return this.truckData;
    }

    public getEditorData(): EditorTruckData {
        const editorTruckData: EditorTruckData = {
            nodes: [],
            beams: [],
            groups: []
        };

        this.truckData.nodes.forEach(currNode => {
            editorTruckData.nodes.push(
                Utils.convertRoRNodeToEditorNode(currNode)
            );
        });

        this.truckData.beams.forEach(currBeam => {
            editorTruckData.beams.push(
                Utils.convertRoRBeamToEditorBeam(currBeam)
            );
        });

        this.truckData.groups.forEach(currGroup => {
            editorTruckData.groups.push(
                Utils.convertRoRGroupToEditorGroup(currGroup)
            );
        });

        return editorTruckData;
    }

    public setEditorData(editorTruckData: EditorTruckData) {
        const nodes: TruckFileNode[] = [];

        editorTruckData.nodes.forEach(currNode => {
            nodes.push({
                id: currNode.id,
                name: currNode.name,
                x: currNode.x,
                y: currNode.y,
                z: currNode.z,
                grp_id: currNode.grp_id,
                type: currNode.parserData.type,
                sbd_preset_id: currNode.parserData.sbd_preset_id,
                snd_preset_id: currNode.parserData.snd_preset_id,
                comment_id: currNode.parserData.comment_id
            });
        });

        this.truckData.nodes = nodes;

        const beams: TruckFileBeam[] = [];

        editorTruckData.beams.forEach(currBeam => {
            beams.push({
                id: currBeam.id,
                node1: currBeam.node1,
                node2: currBeam.node2,
                grp_id: currBeam.grp_id,
                sbd_preset_id: currBeam.parserData.sbd_preset_id,
                snd_preset_id: currBeam.parserData.snd_preset_id,
                comment_id: currBeam.parserData.comment_id
            });
        });

        this.truckData.beams = beams;

        const groups: TruckFileGroup[] = [];

        editorTruckData.groups.forEach(currGrp => {
            groups.push({
                grp_id: currGrp.grp_id,
                title: currGrp.title,
                type: currGrp.type
            });
        });

        this.truckData.groups = groups;
    }
}
