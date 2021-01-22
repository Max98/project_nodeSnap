// @ts-nocheck
import store from "@/store";

addEventListener("message", event => {
    switch (event.data.func) {
        case "dispatch":
            store.dispatch("setTruckData", event.data.data);
            break;

        default:
            break;
    }

    self.postMessage(event.data);
});
