import { Group } from "@tweenjs/tween.js";
import { Store } from "vuex";
import StoreClass from "../../Common/StoreClass";
import {
    EditorBeam,
    EditorGroup,
    EditorNode,
    EditorTruckData
} from "../../TruckEditorInterfaces";

export default class JBeamStore extends StoreClass {
    private jBeam: any;
    private pcData: { title: string; data: any }[] = [];
    constructor() {
        super();
    }

    public loadData(jbeam: any, pcData: { title: string; data: any }[]) {
        this.jBeam = jbeam;
        this.pcData = pcData;
    }

    public reset(): void {
        throw console.error("Not implemented!");
    }

    public create(title: string): void {
        throw console.error("Not implemented!");
    }

    public getEditorData(): EditorTruckData[] {
        const editorTruckData: EditorTruckData[] = [];

        const mainSlots: string[] = [];

        let currSlotId = 0;

        for (const [key, value] of Object.entries(this.jBeam)) {
            const currValue = value as any;
            const nodes: EditorNode[] = [];
            const beams: EditorBeam[] = [];
            let nodeId = 0;
            let visible = false;

            /**
             * Select the first pc file we find
             */
            for (const [key2, value2] of Object.entries(
                this.pcData[0].data.parts
            )) {
                if (currValue["slotType"] == key2) {
                    if (value2 == key) {
                        visible = true;
                    }
                }
            }

            if (currValue["slots"]) {
                for (let i = 0; i < currValue["slots"].length; i++) {
                    const element = currValue["slots"][i];

                    if (
                        element[3] &&
                        Object.prototype.hasOwnProperty.call(
                            element[3],
                            "coreSlot"
                        )
                    ) {
                        mainSlots.push(element[1]);
                    }
                }
            }

            if (mainSlots.find(el => el == key)) {
                visible = true;
            }

            const nodeParams: any = {};

            if (currValue["nodes"]) {
                for (let i = 0; i < currValue["nodes"].length; i++) {
                    const currNode = currValue["nodes"][i];

                    let con = false;

                    if (currNode[0] == "id") {
                        continue;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "nodeWeight"
                        )
                    ) {
                        nodeParams.nodeWeight = currNode.nodeWeight;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "collision"
                        )
                    ) {
                        nodeParams.collision = currNode.collision;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "selfCollision"
                        )
                    ) {
                        nodeParams.selfCollision = currNode.selfCollision;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(currNode, "group")
                    ) {
                        nodeParams.group = currNode.group;

                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "frictionCoef"
                        )
                    ) {
                        nodeParams.frictionCoef = currNode.frictionCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "slidingFrictionCoef"
                        )
                    ) {
                        nodeParams.slidingFrictionCoef =
                            currNode.slidingFrictionCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "treadCoef"
                        )
                    ) {
                        nodeParams.treadCoef = currNode.treadCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "softness"
                        )
                    ) {
                        nodeParams.softness = currNode.softness;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "loadSensitivitySlope"
                        )
                    ) {
                        nodeParams.loadSensitivitySlope =
                            currNode.loadSensitivitySlope;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "noLoadCoef"
                        )
                    ) {
                        nodeParams.noLoadCoef = currNode.noLoadCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "fullLoadCoef"
                        )
                    ) {
                        nodeParams.fullLoadCoef = currNode.fullLoadCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "nodeMaterial"
                        )
                    ) {
                        nodeParams.nodeMaterial = currNode.nodeMaterial;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(currNode, "fixed")
                    ) {
                        nodeParams.fixed = currNode.fixed;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "pairedNode"
                        )
                    ) {
                        nodeParams.pairedNode = currNode.pairedNode;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "burnRate"
                        )
                    ) {
                        nodeParams.burnRate = currNode.burnRate;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "chemEnergy"
                        )
                    ) {
                        nodeParams.chemEnergy = currNode.chemEnergy;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "flashPoint"
                        )
                    ) {
                        nodeParams.flashPoint = currNode.flashPoint;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "selfIgnitionCoef"
                        )
                    ) {
                        nodeParams.selfIgnitionCoef = currNode.selfIgnitionCoef;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "smokePoint"
                        )
                    ) {
                        nodeParams.smokePoint = currNode.smokePoint;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currNode,
                            "specHeat"
                        )
                    ) {
                        nodeParams.specHeat = currNode.specHeat;
                        con = true;
                    }

                    if (con) {
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
                            isVisible: visible,
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
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamSpring"
                        )
                    ) {
                        beamParams.beamSpring = currBeam.beamSpring;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamDamp"
                        )
                    ) {
                        beamParams.beamDamp = currBeam.beamDamp;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamDeform"
                        )
                    ) {
                        beamParams.beamDeform = currBeam.beamDeform;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamStrength"
                        )
                    ) {
                        beamParams.beamStrength = currBeam.beamStrength;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "deformLimit"
                        )
                    ) {
                        beamParams.deformLimit = currBeam.deformLimit;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "deformLimitExpansion"
                        )
                    ) {
                        beamParams.deformLimitExpansion =
                            currBeam.deformLimitExpansion;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "precompression"
                        )
                    ) {
                        beamParams.precompression = currBeam.precompression;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "precompressionTime"
                        )
                    ) {
                        beamParams.precompressionTime =
                            currBeam.precompressionTime;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "precompressionRange"
                        )
                    ) {
                        beamParams.precompressionRange =
                            currBeam.precompressionRange;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "breakGroup"
                        )
                    ) {
                        beamParams.breakGroup = currBeam.breakGroup;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "breakGroupType"
                        )
                    ) {
                        beamParams.breakGroupType = currBeam.breakGroupType;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "deformGroup"
                        )
                    ) {
                        beamParams.deformGroup = currBeam.deformGroup;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "deformationTriggerRatio"
                        )
                    ) {
                        beamParams.deformationTriggerRatio =
                            currBeam.deformationTriggerRatio;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "dampCutoffHz"
                        )
                    ) {
                        beamParams.dampCutoffHz = currBeam.dampCutoffHz;
                        con = true;
                    }
                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "optional"
                        )
                    ) {
                        beamParams.optional = currBeam.optional;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "disableMeshBreaking"
                        )
                    ) {
                        beamParams.disableMeshBreaking =
                            currBeam.disableMeshBreaking;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamPrecompression"
                        )
                    ) {
                        beamParams.beamPrecompression =
                            currBeam.beamPrecompression;

                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamType"
                        )
                    ) {
                        beamParams.beamType = currBeam.beamType;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamLongBound"
                        )
                    ) {
                        beamParams.beamLongBound = currBeam.beamLongBound;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamShortBound"
                        )
                    ) {
                        beamParams.beamShortBound = currBeam.beamShortBound;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "breakGroupType"
                        )
                    ) {
                        beamParams.breakGroupType = currBeam.breakGroupType;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "highlight"
                        )
                    ) {
                        beamParams.highlight = currBeam.highlight;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamLimitSpring"
                        )
                    ) {
                        beamParams.beamLimitSpring = currBeam.beamLimitSpring;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "beamLimitDamp"
                        )
                    ) {
                        beamParams.beamLimitDamp = currBeam.beamLimitDamp;
                        con = true;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            currBeam,
                            "deformLimitExpansion"
                        )
                    ) {
                        beamParams.deformLimitExpansion =
                            currBeam.deformLimitExpansion;
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
                slot: {
                    id: currSlotId,
                    name: key,
                    type: currValue["slotType"],
                    isVisible: visible
                }
            });
            currSlotId++;
        }

        console.log(editorTruckData);

        return editorTruckData;
    }

    public setEditorData(editorTruckData: EditorTruckData[]): void {
        throw console.error("Not implemented!");
    }
}
