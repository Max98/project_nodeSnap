import { createStore, createLogger } from "vuex";

import truckFile from "./modules/truckFile";
import settings from "./modules/settings";

export default createStore({
    modules: { truckFile, settings },
    plugins: [createLogger()]
});
