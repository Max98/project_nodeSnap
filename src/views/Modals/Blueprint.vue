<template>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
            <a
                class="nav-link active"
                id="texture-tab"
                data-bs-toggle="tab"
                href="#texture"
                role="tab"
                >Image</a
            >
        </li>
        <li class="nav-item" role="presentation">
            <a
                class="nav-link"
                id="model-tab"
                data-bs-toggle="tab"
                href="#model"
                role="tab"
                >3D Model</a
            >
        </li>
    </ul>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="texture" role="tabpanel">
            <div class="container" style="padding-top: 5px;">
                <div class="mb-3">
                    <label class="form-label">Image file:</label>
                    <input
                        type="file"
                        class="form-control"
                        id="inputGroupFile01"
                        @change="loadBlueprintFile($event)"
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label"
                        >Opacity: {{ blueprintOpacity }}%</label
                    >
                    <div>
                        <input
                            type="range"
                            class="form-range"
                            id="customRange1"
                            v-model="blueprintOpacity"
                        />
                    </div>
                </div>
                <div class="float-end">
                    <button
                        type="button"
                        class="btn btn-warning"
                        @click="toggleBlueprint()"
                    >
                        Toggle Visibility
                    </button>
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="removeBlueprint()"
                    >
                        Remove
                    </button>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        @click="addBlueprint()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
        <div class="tab-pane fade" id="model" role="tabpanel">
            <div class="container" style="padding-top: 5px;">
                <div class="mb-3">
                    <label class="form-label">Model file: </label
                    ><small class="float-end"
                        >Supported files: ".ogre.xml", ".obj"</small
                    >
                    <input
                        type="file"
                        class="form-control"
                        id="inputGroupFile01"
                        @change="loadModelFile($event)"
                    />
                </div>
                <div class="mb-3">
                    <label class="form-label"
                        >Opacity: {{ modelFileOpacity }}%</label
                    >
                    <div>
                        <input
                            type="range"
                            class="form-range"
                            id="customRange1"
                            v-model="modelFileOpacity"
                        />
                    </div>
                </div>
                <div class="float-end">
                    <button
                        type="button"
                        class="btn btn-warning"
                        @click="toggleModel()"
                    >
                        Toggle Visibility
                    </button>
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="removeModel()"
                    >
                        Remove
                    </button>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        @click="addModel()"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "../../components/vue-decorator";
import { ipcRenderer } from "electron";

export default class Blueprint extends Vue {
    private blueprintFilePath = "";
    private blueprintOpacity = 100;

    private modelFileOpacity = 100;
    private modelFilePath = "";

    /**
     * Blueprint
     */
    loadBlueprintFile(e: any) {
        console.log(e.target.files);
        this.blueprintFilePath = e.target.files[0].path;
    }

    addBlueprint() {
        ipcRenderer.send("blueprintEdit", {
            func: "add",
            data: {
                filePath: this.blueprintFilePath,
                opacity: this.blueprintOpacity / 100
            }
        });
    }

    removeBlueprint() {
        ipcRenderer.send("blueprintEdit", { func: "remove" });
    }

    toggleBlueprint() {
        ipcRenderer.send("blueprintEdit", { func: "toggle" });
    }

    @Watch("blueprintOpacity")
    onBlueprintOpacityChange() {
        ipcRenderer.send("blueprintEdit", {
            func: "set-opacity",
            data: { opacity: this.blueprintOpacity / 100 }
        });
    }

    /**
     * Model
     */
    loadModelFile(e: any) {
        console.log(e.target.files);
        this.modelFilePath = e.target.files[0].path;
    }

    addModel() {
        ipcRenderer.send("modelEdit", {
            func: "add",
            data: {
                filePath: this.modelFilePath,
                opacity: this.modelFileOpacity / 100
            }
        });
    }

    removeModel() {
        ipcRenderer.send("modelEdit", { func: "remove" });
    }

    toggleModel() {
        ipcRenderer.send("modelEdit", { func: "toggle" });
    }

    @Watch("modelFileOpacity")
    onModelOpacityChange() {
        ipcRenderer.send("modelEdit", {
            func: "set-opacity",
            data: { opacity: this.modelFileOpacity / 100 }
        });
    }
}
</script>

<style></style>
