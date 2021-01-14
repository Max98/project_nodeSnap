<template>
    <div>
        <b-modal
            id="modal-addGrp"
            title="BootstrapVue"
            @ok="addGrp"
            cancel-title="Cancel"
            body-bg-variant="dark"
            header-bg-variant="dark"
            footer-bg-variant="dark"
            header-border-variant="dark"
            footer-border-variant="dark"
        >
            <label>Group title:</label>
            <b-form-input v-model="grpTitle"></b-form-input>
            <hr />
            <p>
                You will be adding a new group named
                <b>{{ grpTitle }}</b> before <b>node {{ nodeId }}</b> and will
                affect it to all the nodes after it.
            </p>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import * as TruckEditor from "../../components/Editor/ts/TruckEditor";

@Component({
    name: "",
    components: {}
})
export default class AddGroupModal extends Vue {
    @Prop(Number) readonly nodeId: number = -1;
    @Prop(TruckEditor.default) readonly EditorObj!: TruckEditor.default;

    private grpTitle = "grpTitle";

    addGrp() {
        console.log(this.nodeId);
        this.EditorObj.addGr_node(this.nodeId, this.grpTitle);
    }
}
</script>

<style lang="scss" scoped></style>
