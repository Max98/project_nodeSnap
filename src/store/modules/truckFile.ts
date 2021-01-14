import {
    TruckFileInterface,
    TruckFileNodes,
    TruckFileBeams,
    TruckFileCameras,
    TruckFileCineCam,
    TruckFileWheels2,
    TruckFileWheels
} from "@/components/Editor/ts/TruckFileParser";

import * as rorEditor from "@/components/Editor/ts/TruckEditor";

const state = {
    truckData: { info: { title: "" } } as TruckFileInterface,
    parserSettings: { sectionsKeywordOrder: [] },
    Editor: {} as rorEditor.default,
    truckFilePath: ""
};

const getters = {
    getTruckData: (state: any) => {
        return state.truckData;
    },
    getTruckFilePath: (state: any) => {
        return state.truckFilePath;
    },
    getParserSettings: (state: any) => {
        return state.parserSettings;
    },
    getNodeRealId: (state: any) => (id: string) => {
        return state.truckData.nodes?.filter(
            //@ts-ignore
            currNode => currNode.idEditor == parseInt(id)
        )[0].id!;
    },
    getNodeEditorId: (state: any) => (id: string) => {
        return state.truckData.nodes?.filter(
            //@ts-ignore
            currNode => currNode.id == id
        )[0].idEditor!;
    }
};

const actions = {
    setEditor: (context: any, editor: rorEditor.default) => {
        context.commit("setEditor", editor);
    },
    setTruckData: (context: any, truckData: TruckFileInterface) => {
        context.commit("addTruckData", truckData);
    },
    setTruckFilePath: (context: any, path: string) => {
        context.commit("setTruckFilePath", path);
    },
    setParserSettings: (context: any, data: any) => {
        context.commit("addParserSettings", data);
    },
    setTruckInfo: (
        context: any,
        truckData: {
            title: string;
            dryMass: number;
            cargoMass: number;
            material: string;
        }
    ) => {
        context.commit("setTruckInfo", truckData);
    },
    setTruckNB: (
        context: any,
        truckData: { nodes: TruckFileNodes; beams: TruckFileBeams }
    ) => {
        context.commit("setTruckNB", truckData);
    },
    setTruckCameras: (
        context: any,
        truckData: { cameras: TruckFileCameras; cinecam: TruckFileCineCam }
    ) => {
        context.commit("setTruckCameras", truckData);
    },
    setTruckWheels2: (
        context: any,
        truckData: { wheels2: TruckFileWheels2 }
    ) => {
        context.commit("setTruckWheels2", truckData);
    },
    setTruckWheels: (context: any, truckData: { wheels: TruckFileWheels }) => {
        context.commit("setTruckWheels", truckData);
    },
    reset: (context: any) => {
        context.commit("reset", {});
    },
    applyUINodesData: (context: any, data: TruckFileNodes) => {
        context.commit("applyUINodesData", data);
    },
    applyUIBeamsData: (context: any, data: TruckFileBeams) => {
        context.commit("applyUIBeamsData", data);
    }
};

const mutations = {
    /**
     * Not so sure about this one
     */
    setEditor(state: any, editor: rorEditor.default) {
        state.Editor = editor;
    },
    addTruckData(state: any, truckData: TruckFileInterface) {
        state.truckData = truckData;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckFilePath(state: any, path: string) {
        state.truckFilePath = path;
    },
    addParserSettings(state: any, data: any) {
        state.parserSettings = data;
        state.parserSettings = JSON.parse(JSON.stringify(state.parserSettings));
    },
    setTruckInfo(
        state: any,
        truckData: {
            title: string;
            dryMass: number;
            cargoMass: number;
            material: string;
        }
    ) {
        state.truckData.globals = {
            dryMass: truckData.dryMass,
            cargoMass: truckData.cargoMass,
            material: truckData.material
        };
        state.truckData.info.title = truckData.title;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckNB(
        state: any,
        truckData: { nodes: TruckFileNodes; beams: TruckFileBeams }
    ) {
        state.truckData.nodes = truckData.nodes;
        state.truckData.beams = truckData.beams;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckCameras(
        state: any,
        truckData: { cameras: TruckFileCameras; cinecam: TruckFileCineCam }
    ) {
        state.truckData.cameras = truckData.cameras;
        state.truckData.cineCam = truckData.cinecam;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckWheels2(state: any, truckData: { wheels2: TruckFileWheels2 }) {
        state.truckData.wheels2 = truckData.wheels2;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckWheels(state: any, truckData: { wheels: TruckFileWheels }) {
        state.truckData.wheels = truckData.wheels;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    reset(state: any) {
        state.truckData = { info: { title: "" } } as TruckFileInterface;
        state.parserSettings = { sectionsKeywordOrder: [] };
        state.truckFilePath = "";
    },
    applyUINodesData(state: any, data: TruckFileNodes) {
        state.truckData.nodes = data;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));

        const myEditor: rorEditor.default = state.Editor;
        myEditor.refresh();
    },
    applyUIBeamsData(state: any, data: TruckFileBeams) {
        state.truckData.beams = data;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));

        const myEditor: rorEditor.default = state.Editor;
        myEditor.refresh();
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
