<template>
    <div class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item"></li>
                </ul>
                <div class="d-flex">
                    <div class="dropdown">
                        <a
                            class="nav-link dropdown-toggle"
                            href="#"
                            id="navbarDarkDropdownMenuLink"
                            role="button"
                            data-bs-toggle="dropdown"
                        >
                            File
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a
                                    class="dropdown-item"
                                    @click.prevent="onSave"
                                    href="#"
                                    >Save</a
                                >
                            </li>
                            <li>
                                <a
                                    class="dropdown-item"
                                    href="#"
                                    @click.prevent="onReload"
                                    >Reload file</a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <router-link
                                    @click="onClose"
                                    class="dropdown-item"
                                    to="/"
                                    >Close</router-link
                                >
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";

import { ipcRenderer } from "electron";
import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";

const remote = require("electron").remote;
const { dialog } = remote;

export default class EditorNavBar extends Vue {
    onClose() {
        ipcRenderer.send("hideAllModals");

        this.$store.dispatch("resetSettings");
    }

    onSave() {
        TruckEditorManager.getInstance().saveFile();
    }

    onReload() {
        if (
            TruckEditorManager.getInstance()
                .getEditorObj()
                .getSaveState() == false
        ) {
            const bl = dialog.showMessageBoxSync({
                title: "Confirmation",
                type: "warning",
                buttons: ["Yes", "Cancel"],
                defaultId: 1,
                cancelId: 1,
                message:
                    "Reloading your file will discard all your recent changes. \nAre you sure?"
            });

            if (bl == 1) {
                return false;
            } else {
                TruckEditorManager.getInstance().requestReload();
            }

            return true;
        }
    }
}
</script>

<style>
.navbar {
    padding: 0rem 1rem !important;
}
</style>
