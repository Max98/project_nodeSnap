import Vue from "vue";
import Vuex from "vuex";
import truckFile from "./modules/truckFile";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: { truckFile }
});
