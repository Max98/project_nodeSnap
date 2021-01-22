/**
 * Type definition
 */
interface Settings {
    settings: {
        nodesSpriteScale: number;
        gridSize: number;
        displayNodesName: boolean;
    };
}

const state: Settings = {
    settings: {
        nodesSpriteScale: 1,
        gridSize: 1,
        displayNodesName: false
    }
};

const getters = {
    getSettings: (state: any): any => {
        return state.settings;
    }
};

const actions = {
    setSettings: (context: any, settings: any) => {
        context.commit("setSettings", settings);
    }
};

const mutations = {
    setSettings(state: any, settings: any) {
        state.settings = settings;
        state.settings = JSON.parse(JSON.stringify(state.settings));
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
