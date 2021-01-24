/**
 * Type definition
 */
interface Settings {
    settings: {
        nodesSpriteScale: number;
        gridSize: number;
        displayNodesName: boolean;
    };
    isSaved: boolean;
}

const state: Settings = {
    settings: {
        nodesSpriteScale: 1,
        gridSize: 1,
        displayNodesName: false
    },
    isSaved: false
};

const getters = {
    getSettings: (state: any): any => {
        return state.settings;
    }
};

const actions = {
    setSettings: (context: any, settings: any) => {
        context.commit("setSettings", settings);
    },
    resetSettings: (context: any) => {
        context.commit("resetSettings", {});
    }
};

const mutations = {
    setSettings(state: any, settings: any) {
        state.settings = settings;
        state.settings = JSON.parse(JSON.stringify(state.settings));
    },
    resetSettings(state: any) {
        state.settings = {
            nodesSpriteScale: 1,
            gridSize: 1,
            displayNodesName: false
        };
        state.isSaved = false;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
