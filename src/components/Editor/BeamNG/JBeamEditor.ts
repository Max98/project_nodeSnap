import Editor from "../Common/EditorClass";
import {
    EditorBeam,
    EditorNode,
    EditorTruckData
} from "../TruckEditorInterfaces";
import TruckEditorManager from "../TruckEditorManagaer";
import Utils from "../Utils";
import JBeamStore from "./Parser/JBeamStore";
import BeamNGSceneController from "./Scene/sceneController";

export default class JBeamEditor extends Editor {
    private jBeamData: EditorTruckData[];

    constructor() {
        super();
        this.jBeamData = [];
        console.log("HAI!");
    }

    public reset(): void {
        this.jBeamData = [];
    }

    public getData(): any {
        return this.jBeamData;
    }

    public fetchData(): void {
        this.jBeamData = (TruckEditorManager.getInstance().getStoreObj() as JBeamStore).getEditorData();

        this.jBeamData.forEach(slot => {
            slot.beams.forEach(currBeam => {
                currBeam.node1 = this.getNodeIdByName(currBeam.node1Name!);
                currBeam.node2 = this.getNodeIdByName(currBeam.node2Name!);
            });
        });
    }

    private getNodeIdByName(name: string) {
        let id = -1;
        this.jBeamData.forEach(el => {
            const node = el.nodes.find(currNode => currNode.name == name);
            if (node) {
                id = node.id;
                return;
            }
        });
        return id;
    }

    public loadTruckData(): void {
        const sceneController = TruckEditorManager.getInstance()
            .getRendererObj()
            .getSceneManager()
            .getCurrSceneController() as BeamNGSceneController;

        console.log("load");
        this.jBeamData.forEach(slot => {
            for (let i = 0; i < slot.nodes.length; i++) {
                const currNode = slot.nodes[i];
                sceneController.addNodeToScene(
                    Utils.convertNodeToScene(currNode),
                    slot.slot?.name
                );
            }

            for (let i = 0; i < slot.beams.length; i++) {
                const currBeam = slot.beams[i];
                sceneController.addBeamToScene(
                    Utils.convertBeamToScene(currBeam)
                );
            }
        });

        sceneController.prepareNodes();
        sceneController.buildBeamLines();
        sceneController.postCalc();
        throw console.error("Not implemented!");
    }

    public addNode(position: THREE.Vector3): void {
        throw console.error("Not implemented!");
    }

    public moveNode(
        id: number,
        position: { x: number; y: number; z: number },
        isUndo?: boolean
    ): void {
        throw console.error("Not implemented!");
    }

    public removeNode(id: number): void {
        throw console.error("Not implemented!");
    }

    public setNodeVisibility(id: number, state: boolean): void {
        throw console.error("Not implemented!");
    }

    public setNodeData(node: EditorNode): void {
        throw console.error("Not implemented!");
    }
    public addBeam(beam: { node1: number; node2: number }): void {
        throw console.error("Not implemented!");
    }

    public removeBeam(currBeamId: number): void {
        throw console.error("Not implemented!");
    }
    public setBeamData(beam: EditorBeam): void {
        throw console.error("Not implemented!");
    }
    public renameGrp(grpId: number, title: string): void {
        throw console.error("Not implemented!");
    }
    public removeGrp(grpId: number, destroy?: boolean): void {
        throw console.error("Not implemented!");
    }
    public addGrp(id: number, title: string, type: string): void {
        throw console.error("Not implemented!");
    }
    public duplicateGrp(
        id: number,
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ): void {
        throw console.error("Not implemented!");
    }
    public duplicateVisible(
        type: number,
        axis: string,
        newGrpTitle: string,
        offset: number,
        times: number
    ): void {
        throw console.error("Not implemented!");
    }

    public setGroupVisibility(id: number, state: boolean): void {
        throw console.error("Not implemented!");
    }
    public scaleAll(factor: number, isHistory?: boolean): void {
        throw console.error("Not implemented!");
    }
    public translateAll(
        offset: { x: number; y: number; z: number },
        isHistory?: boolean
    ): void {
        throw console.error("Not implemented!");
    }

    public rotateAll(rot: number, axis: string, isHistory?: boolean): void {
        throw console.error("Not implemented!");
    }
    public requestUndo(): void {
        throw console.error("Not implemented!");
    }
}
