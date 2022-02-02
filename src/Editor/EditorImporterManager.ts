import { Vector3 } from "three";
import EditorData, { EditorSlot } from "./EditorDataInterfaces";
import TruckFileImporter from "./Ex/TruckFileImporter";

export enum Importers {
  JSON,
  RoR,
  BeamNG,
}

export default class EditorImporterMananger {
  constructor() {
    console.log("Importer Manager Init");
  }

  public getCleanData(): EditorData {
    return {
      title: "Untitled",
      slots: [] as EditorSlot[],
    };
  }

  public async loadFile(
    filePath: string,
    importer: Importers
  ): Promise<EditorData> {
    switch (importer) {
      case Importers.RoR:
        return await this.processRoRFile(filePath);

      default:
        return this.getCleanData();
    }
  }

  /**
   * Convert truck file to editor data
   * @param filePath path to truck file
   */
  private async processRoRFile(filePath: string): Promise<EditorData> {
    const fileData = await new TruckFileImporter().loadFile(filePath);
    const editorData: EditorData = this.getCleanData();

    editorData.slots.push({
      id: 0,
      title: fileData.title,
      isVisible: true,
      nodes: [],
      beams: [],
      grps: [],
    });

    fileData.nodes.forEach((el) => {
      editorData.slots[0].nodes.push({
        info: {
          id: el.id,
          name: el.name,
          grpId: el.grpId,
        },
        slotId: 0,
        position: new Vector3(el.x, el.y, el.z),
        isVisible: true,
      });
    });

    fileData.beams.forEach((el) => {
      editorData.slots[0].beams.push({
        info: {
          id: el.id,
          grpId: el.grpId,
        },
        slotId: 0,

        node1: el.node1,
        node2: el.node2,
      });
    });

    fileData.groups?.forEach((el) => {
      editorData.slots[0].grps.push({
        id: el.grpId,
        title: el.title,
        type: el.type,
        isVisible: true,
      });
    });

    return editorData;
  }
}
