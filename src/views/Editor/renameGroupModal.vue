<template>
    <div>
        <b-modal
            id="modal-renameGrp"
            title="BootstrapVue"
            @ok="renameGrp"
            cancel-title="Cancel"
            body-bg-variant="dark"
            header-bg-variant="dark"
            footer-bg-variant="dark"
            header-border-variant="dark"
            footer-border-variant="dark"
        >
            <label>Group title:</label>
            <b-form-input v-model="grpTitleLocal"></b-form-input>
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
export default class RenameGroupModal extends Vue {
    @Prop(Number) readonly grpId: number = -1;
    @Prop(TruckEditor.default) readonly EditorObj!: TruckEditor.default;

    @Prop(String) grpTitle!: string;

    //avoiding vue warn
    private myGrpTitle = "";
    get grpTitleLocal() {
        return this.grpTitle;
    }
    set grpTitleLocal(value) {
        this.myGrpTitle = value;
    }

    renameGrp() {
        this.EditorObj.renameGrp(this.grpId, this.myGrpTitle);
    }
}
</script>

<style lang="scss" scoped></style>
