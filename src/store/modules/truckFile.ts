import { TruckFileInterface } from "@/components/Editor/ts/TruckFileInterfaces";
import { markRaw } from "vue";

/**
 * Type definition
 */
interface Truck {
    parserSettings: { sectionsKeywordOrder: number[] };
    truckFilePath: string;
}

const state: Truck = {
    parserSettings: { sectionsKeywordOrder: [] },
    truckFilePath: ""
};

const getters = {
    getParserSettings: (state: any) => {
        return state.parserSettings;
    }
};

const actions = {
    setParserSettings: (context: any, data: any) => {
        context.commit("setParserSettings", data);
    },

    /** */
    reset: (context: any) => {
        context.commit("reset", {});
    }
};

const mutations = {
    setParserSettings(state: any, data: any) {
        state.parserSettings = data;
        state.parserSettings = JSON.parse(JSON.stringify(state.parserSettings));
    },

    /** */
    reset(state: any) {
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
