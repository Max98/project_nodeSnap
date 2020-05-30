<template>
    <div>
        <b-modal
            id="modal-loadBluePrints"
            title="BootstrapVue"
            @ok="loadBluePrints"
            cancel-title="Cancel"
            body-bg-variant="dark"
            header-bg-variant="dark"
            footer-bg-variant="dark"
            header-border-variant="dark"
            footer-border-variant="dark"
        >
            <b-form-file
                style="margin-bottom: 10px"
                v-model="bluePrintFile"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
            ></b-form-file>
            <b-button variant="danger" @click="removeBluePrints">
                Remove current
            </b-button>
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
export default class LoadBluePrintsModal extends EditorComponent {
    private bluePrintFile: File | null = null;

    created() {
        this.init();
    }

    loadBluePrints() {
        if (this.bluePrintFile)
            this.EditorObj.loadBluePrints(this.bluePrintFile);
    }

    removeBluePrints() {
        this.bluePrintFile = null;
        this.EditorObj.removeBluePrints();
    }
}
</script>

<style lang="scss" scoped></style>
