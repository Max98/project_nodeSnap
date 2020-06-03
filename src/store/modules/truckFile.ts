import Vue from "vue";
import {
    TruckFileInterface,
    TruckFileNodes,
    TruckFileBeams,
    TruckFileCameras,
    TruckFileCineCam,
    TruckFileWheels2,
    TruckFileWheels
} from "@/components/Editor/ts/TruckFileParser";

const state = {
    truckData: { info: { title: "" } } as TruckFileInterface
};

const getters = {
    getTruckData: (state: any) => {
        return state.truckData;
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
    setTruckData: (context: any, truckData: TruckFileInterface) => {
        context.commit("addTruckData", truckData);
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
    }
};

const mutations = {
    addTruckData(state: any, truckData: TruckFileInterface) {
        //state.truckData.pop();
        state.truckData = truckData;

        state.truckData = JSON.parse(JSON.stringify(state.truckData));
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
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
