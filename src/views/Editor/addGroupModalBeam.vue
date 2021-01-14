<template>
    <div>
        <b-modal
            id="modal-addGrpBeam"
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
                <b>{{ grpTitle }}</b> before <b>beam {{ beamId }}</b> and will
                affect it to all beams after it.
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
export default class AddGroupModalBeam extends Vue {
    @Prop(Number) readonly beamId: number = -1;
    @Prop(TruckEditor.default) readonly EditorObj!: TruckEditor.default;

    private grpTitle = "grpTitle";

    addGrp() {
        console.log(this.beamId);
        this.EditorObj.addGrp_beam(this.beamId, this.grpTitle);
    }
}
</script>

<style lang="scss" scoped></style>
