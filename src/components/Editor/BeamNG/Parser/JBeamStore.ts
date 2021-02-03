import { Group } from "@tweenjs/tween.js";
import { Store } from "vuex";
import StoreClass from "../../Common/StoreClass";
import {
    EditorBeam,
    EditorNode,
    EditorTruckData
} from "../../TruckEditorInterfaces";

export default class JBeamStore extends StoreClass {
    private jBeam: any;

    constructor() {
        super();
    }

    public loadData(jbeam: any) {
        this.jBeam = jbeam;
    }

    public reset(): void {
        throw console.error("Not implemented!");
    }

    public create(title: string): void {
        throw console.error("Not implemented!");
    }

    public getEditorData(): EditorTruckData[] {
        const editorTruckData: EditorTruckData[] = [];

        let nodeId = 0;
        for (const [key, value] of Object.entries(this.jBeam)) {
            const currValue = value as any;
            const nodes: EditorNode[] = [];
            const beams: EditorBeam[] = [];

            /* const params = {
                nodeWeight: 25,
                collision: true,
                selfCollision: false,
                group: "",
                frictionCoef: 1,
                slidingFrictionCoef: 1,
                treadCoef: 0.5,
                softness: 0,
                loadSensitivitySlope: 0,
                noLoadCoef: 1,
                fullLoadCoef: 0,
                nodeMaterial: "",
                fixed: false,
                pairedNode: ""
            };*/

            const nodeParams: any = {};

            if (currValue["nodes"]) {
                for (let i = 0; i < currValue["nodes"].length; i++) {
                    const currNode = currValue["nodes"][i];

                    if (currNode[0] == "id") {
                        continue;
                    }

                    if (currNode.nodeWeight) {
                        nodeParams.nodeWeight = currNode.nodeWeight;
                        continue;
                    }

                    if (currNode.collision) {
                        nodeParams.collision = currNode.collision;
                        continue;
                    }

                    if (currNode.selfCollision) {
                        nodeParams.selfCollision = currNode.selfCollision;
                        continue;
                    }

                    if (currNode.group) {
                        nodeParams.group = currNode.group;
                        continue;
                    }
                    if (currNode.frictionCoef) {
                        nodeParams.frictionCoef = currNode.frictionCoef;
                        continue;
                    }
                    if (currNode.slidingFrictionCoef) {
                        nodeParams.slidingFrictionCoef =
                            currNode.slidingFrictionCoef;
                        continue;
                    }
                    if (currNode.treadCoef) {
                        nodeParams.treadCoef = currNode.treadCoef;
                        continue;
                    }
                    if (currNode.softness) {
                        nodeParams.softness = currNode.softness;
                        continue;
                    }
                    if (currNode.loadSensitivitySlope) {
                        nodeParams.loadSensitivitySlope =
                            currNode.loadSensitivitySlope;
                        continue;
                    }
                    if (currNode.noLoadCoef) {
                        nodeParams.noLoadCoef = currNode.noLoadCoef;
                        continue;
                    }
                    if (currNode.fullLoadCoef) {
                        nodeParams.fullLoadCoef = currNode.fullLoadCoef;
                        continue;
                    }
                    if (currNode.nodeMaterial) {
                        nodeParams.nodeMaterial = currNode.nodeMaterial;
                        continue;
                    }
                    if (currNode.fixed) {
                        nodeParams.fixed = currNode.fixed;
                        continue;
                    }
                    if (currNode.pairedNode) {
                        nodeParams.pairedNode = currNode.pairedNode;
                        continue;
                    }

                    /**
                     * We should have a valid node here
                     */
                    if (typeof currNode[0] === "string") {
                        const newNode: EditorNode = {
                            id: nodeId,
                            name: currNode[0],
                            x: currNode[1],
                            y: currNode[2],
                            z: currNode[3],
                            grp_id: -1,
                            isVisible: true,
                            options: "",
                            parserData: { params: { ...nodeParams } }
                        };
                        nodeId++;
                        nodes.push(newNode);
                    }
                }
            }

            const beamParams: any = {};
            if (currValue["beams"]) {
                for (let i = 0; i < currValue["beams"].length; i++) {
                    const currBeam = currValue["beams"][i];

                    let con = false;

                    if (currBeam[0] == "id1:") {
                        continue;
                    }

                    /**
                     * Normal beams
                     */
                    if (currBeam.beamSpring) {
                        beamParams.beamSpring = currBeam.beamSpring;
                        con = true;
                    }
                    if (currBeam.beamDamp) {
                        beamParams.beamDamp = currBeam.beamDamp;
                        con = true;
                    }
                    if (currBeam.beamDeform) {
                        beamParams.beamDeform = currBeam.beamDeform;
                        con = true;
                    }
                    if (currBeam.beamStrength) {
                        beamParams.beamStrength = currBeam.beamStrength;
                        con = true;
                    }
                    if (currBeam.deformLimit) {
                        beamParams.deformLimit = currBeam.deformLimit;
                        con = true;
                    }
                    if (currBeam.deformLimitExpansion) {
                        beamParams.deformLimitExpansion =
                            currBeam.deformLimitExpansion;
                        con = true;
                    }
                    if (currBeam.precompression) {
                        beamParams.precompression = currBeam.precompression;
                        con = true;
                    }
                    if (currBeam.precompressionTime) {
                        beamParams.precompressionTime =
                            currBeam.precompressionTime;
                        con = true;
                    }
                    if (currBeam.precompressionRange) {
                        beamParams.precompressionRange =
                            currBeam.precompressionRange;
                        con = true;
                    }

                    if (currBeam.breakGroup || currBeam.breakGroup == "") {
                        beamParams.breakGroup = currBeam.breakGroup;
                        con = true;
                    }
                    if (currBeam.breakGroupType) {
                        beamParams.breakGroupType = currBeam.breakGroupType;
                        con = true;
                    }
                    if (currBeam.deformGroup) {
                        beamParams.deformGroup = currBeam.deformGroup;
                        con = true;
                    }
                    if (currBeam.deformationTriggerRatio) {
                        beamParams.deformationTriggerRatio =
                            currBeam.deformationTriggerRatio;
                        con = true;
                    }
                    if (currBeam.dampCutoffHz) {
                        beamParams.dampCutoffHz = currBeam.dampCutoffHz;
                        con = true;
                    }
                    if (currBeam.optional) {
                        beamParams.optional = currBeam.optional;
                        con = true;
                    }

                    if (
                        currBeam.disableMeshBreaking ||
                        currBeam.disableMeshBreaking == false
                    ) {
                        beamParams.disableMeshBreaking =
                            currBeam.disableMeshBreaking;
                        con = true;
                    }

                    if (currBeam.beamPrecompression) {
                        beamParams.beamPrecompression =
                            currBeam.beamPrecompression;

                        con = true;
                    }

                    if (currBeam.beamType) {
                        beamParams.beamType = currBeam.beamType;
                        con = true;
                    }

                    if (currBeam.beamLongBound || currBeam.beamLongBound == 0) {
                        beamParams.beamLongBound = currBeam.beamLongBound;
                        con = true;
                    }

                    if (
                        currBeam.beamShortBound ||
                        currBeam.beamShortBound == 0
                    ) {
                        beamParams.beamShortBound = currBeam.beamShortBound;
                        con = true;
                    }

                    if (
                        currBeam.breakGroupType ||
                        currBeam.breakGroupType == 0
                    ) {
                        beamParams.breakGroupType = currBeam.breakGroupType;
                        con = true;
                    }

                    if (currBeam.highlight || currBeam.highlight == false) {
                        beamParams.highlight = currBeam.highlight;
                        con = true;
                    }

                    if (currBeam.beamLimitSpring) {
                        beamParams.beamLimitSpring = currBeam.beamLimitSpring;
                        con = true;
                    }

                    if (currBeam.beamLimitDamp) {
                        beamParams.beamLimitDamp = currBeam.beamLimitDamp;
                        con = true;
                    }

                    if (con) {
                        continue;
                    }

                    if (typeof currBeam[0] == "string") {
                        const newBeam: EditorBeam = {
                            id: -1,
                            node1: -1,
                            node2: -1,
                            node1Name: currBeam[0],
                            node2Name: currBeam[1],
                            options: "",
                            grp_id: -1,
                            isVisible: true,
                            parserData: { params: { ...beamParams } }
                        };

                        beams.push(newBeam);
                    }
                }
            }

            /**
             * We don't need anything without at least one node
             */
            if (nodes.length == 0) continue;

            editorTruckData.push({
                nodes,
                beams,
                groups: [],
                slot: { name: currValue["slotType"], isVisible: true }
            });
        }

        return editorTruckData;
    }

    public setEditorData(editorTruckData: EditorTruckData[]): void {
        throw console.error("Not implemented!");
    }
}
