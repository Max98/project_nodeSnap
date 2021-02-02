<template>
    <div class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid" style="padding: 0;">
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <div class="dropdown">
                            <a
                                class="nav-link dropdown-toggle"
                                href="#"
                                id="navbarDarkDropdownMenuLink"
                                role="button"
                                data-bs-toggle="dropdown"
                            >
                                Edit
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <h6 class="dropdown-header">Transform</h6>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item"
                                        href="#"
                                        @click.prevent="onScale()"
                                        >Scale</a
                                    >
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item"
                                        href="#"
                                        @click.prevent="onMove()"
                                        >Move</a
                                    >
                                </li>

                                <li>
                                    <a
                                        class="dropdown-item"
                                        href="#"
                                        @click.prevent="onRotate()"
                                    >
                                        Rotate</a
                                    >
                                </li>
                                <li><hr class="dropdown-divider" /></li>
                                <li>
                                    <h6 class="dropdown-header">Functions</h6>
                                </li>
                                <li>
                                    <a
                                        class="dropdown-item"
                                        href="#"
                                        @click.prevent="onDuplicateVisible()"
                                    >
                                        Duplicate visible</a
                                    >
                                </li>
                            </ul>
                        </div>
                    </li>
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
                                    @click.prevent="onSave()"
                                    href="#"
                                    >Save</a
                                >
                            </li>
                            <li>
                                <a
                                    class="dropdown-item"
                                    href="#"
                                    @click.prevent="onReload()"
                                    >Reload file</a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <a
                                    class="dropdown-item"
                                    href="#"
                                    @click.prevent="onAbout()"
                                    >About</a
                                >
                            </li>
                            <li><hr class="dropdown-divider" /></li>
                            <li>
                                <router-link
                                    @click="onClose()"
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
import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";
import { useToast } from "vue-toastification";

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
                .getFilePath() == ""
        ) {
            useToast().warning(
                "You need to save your project at least once before reloading!"
            );
            return;
        }

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

    onScale() {
        ipcRenderer.send("setModalVisibility", {
            name: "transformScale",
            state: true
        });
    }

    onMove() {
        ipcRenderer.send("setModalVisibility", {
            name: "transformTranslation",
            state: true
        });
    }

    onRotate() {
        ipcRenderer.send("setModalVisibility", {
            name: "transformRotation",
            state: true
        });
    }

    onAbout() {
        ipcRenderer.send("setModalVisibility", {
            name: "about",
            state: true
        });
    }

    onDuplicateVisible() {
        ipcRenderer.send("setModalVisibility", {
            name: "duplicateVisible",
            state: true
        });
    }
}
</script>

<style>
.navbar {
    padding: 0rem 1rem !important;
}
</style>
