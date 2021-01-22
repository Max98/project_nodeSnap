import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "bootstrap";
import "./sass/bootstrap.scss";
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";
import TruckEditorManager from "./components/Editor/ts/TruckEditorManagaer";

new TruckEditorManager();

/**
 * Toast
 * https://github.com/Maronato/vue-toastification/tree/next
 */
import Toast, { PluginOptions, POSITION } from "vue-toastification";
import "./sass/toast.scss";

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
    timeout: false,
    icon: false
};

/**
 * Init UI
 */
const app = createApp(App)
    .use(store)
    .use(router)
    .use(BootstrapIconsPlugin)
    .use(Toast, options)
    .mount("#app");
