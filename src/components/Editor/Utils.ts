import { Vector3 } from "three";
import { SceneBeam, SceneNode } from "./Common/SceneController";
import {
    TruckFileBeam,
    TruckFileGroup,
    TruckFileNode
} from "./RoR/RoRTruckFileInterfaces";
import { EditorBeam, EditorGroup, EditorNode } from "./TruckEditorInterfaces";

export default class Utils {
    /**
     * Converts a RoR node to an EditorNode
     * @param currNode
     */
    public static convertRoRNodeToEditorNode(
        currNode: TruckFileNode
    ): EditorNode {
        const newNode: EditorNode = {
            id: currNode.id,
            name: currNode.name,
            x: currNode.x,
            y: currNode.y,
            z: currNode.z,
            options: currNode.options ? currNode.options : "",
            grp_id: currNode.grp_id,
            isVisible: true,
            parserData: {
                sbd_preset_id: currNode.sbd_preset_id,
                snd_preset_id: currNode.snd_preset_id,
                comment_id: currNode.comment_id,
                type: currNode.type
            }
        };

        return newNode;
    }

    /**
     * Converts a RoR beam to an EditorBeam
     * @param currBeam
     */
    public static convertRoRBeamToEditorBeam(
        currBeam: TruckFileBeam
    ): EditorBeam {
        const newBeam: EditorBeam = {
            id: currBeam.id,
            node1: currBeam.node1,
            node2: currBeam.node2,
            options: currBeam.options ? currBeam.options : "",
            grp_id: currBeam.grp_id,
            isVisible: true,
            parserData: {
                sbd_preset_id: currBeam.sbd_preset_id,
                snd_preset_id: currBeam.snd_preset_id,
                comment_id: currBeam.comment_id
            }
        };

        return newBeam;
    }

    /**
     * Converts a RoR group to an EditorGroup
     * @param currGroup
     */
    public static convertRoRGroupToEditorGroup(
        currGroup: TruckFileGroup
    ): EditorGroup {
        const newGrp: EditorGroup = {
            grp_id: currGroup.grp_id,
            title: currGroup.title,
            type: currGroup.type,
            isVisible: true
        };

        return newGrp;
    }
    /**
     * Converts an EditorNode to a SceneNode
     * @param currNode EditorNode
     */
    public static convertNodeToScene(currNode: EditorNode): SceneNode {
        const sceneNode: SceneNode = {
            position: new Vector3(currNode.x, currNode.y, currNode.z),
            visible: currNode.isVisible,
            nodeInfo: {
                nodeId: currNode.id,
                nodeName: currNode.name,
                grpId: currNode.grp_id
            }
        };
        return sceneNode;
    }

    public static convertBeamToScene(currBeam: EditorBeam): SceneBeam {
        const sceneBeam: SceneBeam = {
            node1: currBeam.node1,
            node2: currBeam.node2,
            node1Name: currBeam.node1Name,
            node2Name: currBeam.node2Name
        };
        return sceneBeam;
    }
}
