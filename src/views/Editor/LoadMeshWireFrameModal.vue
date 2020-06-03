<template>
    <div>
        <b-modal
            id="modal-meshwireframe"
            title="BootstrapVue"
            @ok="loadMeshWireframe"
            cancel-title="Cancel"
            body-bg-variant="dark"
            header-bg-variant="dark"
            footer-bg-variant="dark"
            header-border-variant="dark"
            footer-border-variant="dark"
        >
            <b-form-file
                style="margin-bottom: 10px"
                v-model="meshWireframeFile"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
            ></b-form-file>
            <b-button variant="danger" @click="removeMeshWireframe">Remove current</b-button>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import EditorComponent from "./class";
import TruckEditor from "../../components/Editor/ts/TruckEditor";

@Component({
    name: "",
    components: {}
})
export default class LoadMeshWireframeModal extends EditorComponent {
    private meshWireframeFile: File | null = null;

    created() {
        this.init();
    }

    loadMeshWireframe() {
        if (this.meshWireframeFile)
            this.EditorObj.loadMeshWireframe(this.meshWireframeFile);
    }

    removeMeshWireframe() {
        this.meshWireframeFile = null;
        //this.EditorObj.removeBluePrints();
    }
}
</script>

<style lang="scss" scoped></style>
