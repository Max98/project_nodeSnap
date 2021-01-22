import { TruckFileInterface } from "@/components/Editor/ts/TruckFileInterfaces";
import { markRaw } from "vue";

/**
 * Type definition
 */
interface Truck {
    truckData: TruckFileInterface;
    parserSettings: { sectionsKeywordOrder: number[] };
    truckFilePath: string;
}

const state: Truck = {
    truckData: {
        title: "",
        globals: {
            dryMass: 1000,
            cargoMass: 1000,
            material: "",
            sbd_preset_id: -1,
            snd_preset_id: -1,
            grp_id: -1,
            comment_id: -1
        },
        nodes: [],
        beams: []
    },
    parserSettings: { sectionsKeywordOrder: [] },
    truckFilePath: ""
};

const getters = {
    getTruckData: (state: any): TruckFileInterface => {
        return markRaw(state.truckData);
    },
    getTruckFilePath: (state: any): string => {
        return state.truckFilePath;
    },
    getParserSettings: (state: any) => {
        return state.parserSettings;
    }
};

const actions = {
    setTruckData: (context: any, truckData: TruckFileInterface) => {
        context.commit("setTruckData", truckData);
    },
    setTruckFilePath: (context: any, path: string) => {
        context.commit("setTruckFilePath", path);
    },
    setParserSettings: (context: any, data: any) => {
        context.commit("setParserSettings", data);
    },

    /** */
    reset: (context: any) => {
        context.commit("reset", {});
    }
};

const mutations = {
    setTruckData(state: any, truckData: TruckFileInterface) {
        state.truckData = truckData;
        state.truckData = JSON.parse(JSON.stringify(state.truckData));
    },
    setTruckFilePath(state: any, path: string) {
        state.truckFilePath = path;
    },
    setParserSettings(state: any, data: any) {
        state.parserSettings = data;
        state.parserSettings = JSON.parse(JSON.stringify(state.parserSettings));
    },

    /** */
    reset(state: any) {
        state.truckData = {
            title: "",
            globals: {
                dryMass: 1000,
                cargoMass: 1000,
                material: "",
                sbd_preset_id: -1,
                snd_preset_id: -1,
                grp_id: -1,
                comment_id: -1
            },
            nodes: [],
            beams: []
        } as TruckFileInterface;
        state.parserSettings = { sectionsKeywordOrder: [] };
        state.truckFilePath = "";
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
