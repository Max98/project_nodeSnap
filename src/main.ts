import { createApp } from "vue";
import MainApp from "./views/Main/App.vue";
import ModalApp from "./views/Modals/App.vue";
import router from "./router";
import store from "./store";
import { ipcRenderer } from "electron";

import "bootstrap";
import "./sass/bootstrap.scss";
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";
import TruckEditorManager from "./components/Editor/ts/TruckEditorManagaer";

/**
 * Toast
 * https://github.com/Maronato/vue-toastification/tree/next
 */
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "./sass/toast.scss";

import { version } from "../package.json";

const options: PluginOptions = {
    // You can set your default options here
    newestOnTop: true,
    position: POSITION.BOTTOM_RIGHT,
    hideProgressBar: true,
    transition: "none",
    draggable: false,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    closeOnClick: false,
    closeButton: "button",
    timeout: 3000,
    icon: false
};

/**
 * Init UI
 */

ipcRenderer.on("setId", (e, arg) => {
    if (arg.id == "Main") {
        const app = createApp(MainApp);
        new TruckEditorManager();

        app.use(router);
        app.use(BootstrapIconsPlugin);
        app.use(Toast, options);
        app.use(store);
        app.mount("#app");

        app.config.globalProperties.$snapVersion = version;
    } else if (arg.id == "Modal") {
        //Modals stuff
        const app = createApp(ModalApp);
        app.use(router);
        app.use(BootstrapIconsPlugin);
        app.mount("#app");
    }
});
