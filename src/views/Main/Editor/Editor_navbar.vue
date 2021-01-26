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
                                <a class="dropdown-item disabled" href="#"
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

export default class EditorNavBar extends Vue {
    onClose() {
        ipcRenderer.send("hideAllModals");
        

        this.$store.dispatch("resetSettings");
    }

    onSave() {
        TruckEditorManager.getInstance().saveFile();
    }
}
</script>

<style>
.navbar {
    padding: 0rem 1rem !important;
}
</style>
