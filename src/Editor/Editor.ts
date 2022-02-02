import EditorData, {
  EditorBeam,
  EditorNode,
  EditorSlot,
} from "./EditorDataInterfaces";

import EditorRenderer from "./EditorRenderer";
import EditorImporterMananger, { Importers } from "./EditorImporterManager";
import { Vector3 } from "three";
import gVars from "./Bridge";

export default class Editor {
  // private logger: myLogger.LogFunctions;

  private renderInstance: EditorRenderer;

  private editorData: EditorData;
  private importerManager: EditorImporterMananger;

  private UIFunc: Function | null = null;

  private selectedSlotId = 0;

  constructor(
    _renderInstance: EditorRenderer,
    _ImporterManager: EditorImporterMananger
  ) {
    console.info("init");
    this.renderInstance = _renderInstance;
    this.importerManager = _ImporterManager;

    /**
     * Base structure
     */
    this.editorData = this.importerManager.getCleanData();
  }

  /**
   * fetch data
   */
  public async loadData(filePath: string, importer: Importers) {
    this.editorData = await this.importerManager.loadFile(filePath, importer);

    this.loadSlotsToScene();

    this.sendUpdate();
  }

  private loadSlotsToScene() {
    this.renderInstance.getSceneController().reset();

    this.editorData.slots.forEach((slot) => {
      this.renderInstance
        .getSceneController()
        .addSlot(slot.id, slot.title, slot.isVisible);

      slot.nodes.forEach((node) => {
        this.renderInstance.getSceneController().addNode(node, slot.id);
      });

      slot.beams.forEach((beam) => {
        this.renderInstance.getSceneController().addBeam(beam, slot.id);
      });
    });
    this.renderInstance.getSceneController().finalize();
  }

  /**
   * Functions
   */
  public addNode(position: Vector3) {
    //Check for overlaping node
    const overlap =
      this.editorData.slots[this.selectedSlotId].nodes.filter(
        (el) => el.position == position
      ).length != 0;

    if (overlap) {
      console.error("Failed to add new node: overlap detected.");
      return;
    }

    const nodeId = this.getLastNodeId() + 1;
    const lastGrpId = this.getLastGroupId("node");

    const currNode: EditorNode = {
      info: {
        grpId: lastGrpId,
        id: nodeId,
        name: nodeId.toString(),
      },
      position,
      isVisible: true,
    };

    this.editorData.slots[this.selectedSlotId].nodes.push(currNode);
    this.renderInstance
      .getSceneController()
      .addNode(currNode, this.selectedSlotId);

    this.sendUpdate();
  }

  /**
   *
   * @param id
   * @param slotId
   * @param pos
   * @returns
   */
  public moveNode(id: Number, slotId: number, pos: Vector3) {
    const currNode = this.editorData.slots[slotId].nodes.find(
      (node) => node.info.id == id
    );

    console.log(currNode);

    if (currNode == undefined) {
      console.error("node not found");
      return;
    }

    currNode.position = pos;
    this.renderInstance.getSceneController().buildBeamLines();
  }

  /**
   *
   * @returns
   */
  public addBeam(node1: number, node2: number, slotId: number = 0) {
    const beamId = this.getLastBeamId() + 1;
    const lastGrpId = this.getLastGroupId("beam");

    slotId = this.selectedSlotId;

    if (node1 == node2) {
      console.error("Failed to add new beam: zero-length beam detected.");
      return;
    }

    if (
      this.editorData.slots[slotId].beams.find(
        (el) => el.node1 == node1 && el.node2 == node2
      ) ||
      this.editorData.slots[slotId].beams.find(
        (el) => el.node1 == node2 && el.node2 == node1
      )
    ) {
      console.error("Failed to add new beam: overlap detected.");
      return;
    }

    const newBeam = {
      node1: node1,
      node2: node2,
      info: {
        id: beamId,
        grpId: lastGrpId,
      },
    };

    this.editorData.slots[slotId].beams.push(newBeam);

    this.renderInstance.getSceneController().addBeam(newBeam, slotId);
    this.renderInstance.getSceneController().buildBeamLines();
    this.sendUpdate();
  }

  /**
   * Remove a beam
   * @param currBeamId beamId
   */
  public removeBeam(currBeamId: number, slotId: number) {
    const currBeam = this.editorData.slots[slotId].beams.filter(
      (el) => el.info.id == currBeamId
    );
    if (currBeam.length == 0) return;

    this.editorData.slots[slotId].beams = this.editorData.slots[
      slotId
    ].beams.filter((el) => el != currBeam[0]);

    for (
      let i = 0, n = this.editorData.slots[slotId].beams.length;
      i < n;
      i++
    ) {
      const currBeam = this.editorData.slots[slotId].beams[i];

      if (currBeam.info.id > currBeamId) {
        currBeam.info.id -= 1;
      }
    }

    this.renderInstance.getSceneController().removeBeam(slotId, currBeamId);
    this.renderInstance.getSceneController().buildBeamLines();

    this.sendUpdate();
  }

  /**
   * remove a specific node without updating all the nodes after it
   * @param id
   */
  private removeNodeLoop(id: number, slotId: number) {
    this.editorData.slots[slotId].nodes = this.editorData.slots[
      slotId
    ].nodes.filter((el) => el.info.id != id);

    this.editorData.slots[slotId].beams = this.editorData.slots[
      slotId
    ].beams.filter(
      (el) => el.node1 != id && el.node2 != id //thanks only_a_ptr ;)
    );
  }

  /**
   * remove a specific node and update everything after it
   * @param id nodeId
   */
  public removeNode(id: number, slotId: number) {
    this.removeNodeLoop(id, slotId);

    for (
      let i = 0, n = this.editorData.slots[slotId].nodes.length;
      i < n;
      i++
    ) {
      const currNode = this.editorData.slots[slotId].nodes[i];
      if (currNode.info.id > id) {
        currNode.info.id -= 1;
      }
    }

    for (
      let i = 0, n = this.editorData.slots[slotId].beams.length;
      i < n;
      i++
    ) {
      const currBeam = this.editorData.slots[slotId].beams[i];

      if (currBeam.node1 > id) {
        currBeam.node1 -= 1;
      }

      if (currBeam.node2 > id) {
        currBeam.node2 -= 1;
      }
    }

    this.loadSlotsToScene();
    this.sendUpdate();
  }

  /**
   * Utils
   */

  /**
   * Returns last node's id
   */
  private getLastNodeId(): number {
    //Since everything is orderd, we can do this
    return this.editorData.slots[this.selectedSlotId].nodes.length - 1;
  }
  /**
   * Returns last beam id
   */
  private getLastBeamId(): number {
    //Since everything is orderd, we can do this
    return this.editorData.slots[this.selectedSlotId].beams.length - 1;
  }

  /**
   * returns either all groups last id, nodes groups last id or beam groups last id
   * @param type item type either "node" or "beam"
   */
  private getLastGroupId(type?: string) {
    if (this.editorData.slots[this.selectedSlotId].grps == undefined) return -1;

    if (type == undefined)
      return this.editorData.slots[this.selectedSlotId].grps.length - 1;

    const typeGrps = this.editorData.slots[this.selectedSlotId].grps.filter(
      (el) => el.type == type
    );

    if (typeGrps.length != 0) {
      return typeGrps[typeGrps.length - 1].id;
    } else {
      return -1;
    }
  }

  /**
   * Update the UI
   */
  public sendUpdate() {
    if (gVars.updateUI) {
      gVars.updateUI(this.editorData);
    }
  }

  public setSelectedSlotId(id: number) {
    this.selectedSlotId = id;
  }

  /**
   * change a slot's visibility
   * @param id slot id
   * @param state visibility
   */
  public setSlotVisibility(id: number, state: boolean) {
    this.renderInstance.getSceneController().setSlotVisibility(id, state);

    this.editorData.slots[id].isVisible = state;

    this.sendUpdate();
  }

  /**
   * change a slot's visibility
   * @param id slot id
   * @param state visibility
   */
  public setGrpVisibility(slotId: number, grpId: number, state: boolean) {
    this.renderInstance
      .getSceneController()
      .setGrpVisibility(slotId, grpId, state);

    this.editorData.slots[slotId].nodes
      .filter((node) => node.info.grpId == grpId)
      .forEach((el) => {
        el.isVisible = state;
      });

    this.editorData.slots[slotId].grps.find(
      (grp) => grp.id == grpId
    )!.isVisible = state;

    this.sendUpdate();
  }

  /**
   * change a node's visibility
   * @param id node id
   * @param state visibility
   */
  public setNodeVisibility(slotId: number, nodeId: number, state: boolean) {
    this.renderInstance
      .getSceneController()
      .setNodeVisibility(slotId, nodeId, state);

    this.editorData.slots[slotId].nodes.find(
      (node) => node.info.id == nodeId
    )!.isVisible = state;

    this.sendUpdate();
  }

  /**
   * Set a specific node to specific data
   * @param node
   */
  public setNodeData(slotId: number, node: EditorNode) {
    const currNode = this.editorData.slots[slotId].nodes.find(
      (currNode) => currNode.info.id == node.info.id
    );

    if (currNode == undefined) {
      //case where select last node, then delete the node
      // useToast().warning("Could not find node: " + node.id);
      return;
    }

    Object.assign(currNode, node);

    this.renderInstance
      .getSceneController()
      .moveNodeSprite(slotId, currNode.info.id, currNode.position);

    this.renderInstance.getSceneController().buildBeamLines();
    this.sendUpdate();
  }

  public setBeamData(slotId: number, beam: EditorBeam) {
    const currBeam = this.editorData.slots[slotId].beams.find(
      (el) => el.info.id == beam.info.id
    );

    if (!currBeam) {
      console.error("Beam not found");
      return;
    }

    Object.assign(currBeam, beam);

    this.renderInstance.getSceneController().updateBeam(slotId, beam);
    this.renderInstance.getSceneController().buildBeamLines();

    this.sendUpdate();
  }
}
