<template>
    <div>
        <div class="d-grid gap-2">
            <button @click="openSettings()" class="btn btn-secondary me-0">
                Settings
            </button>
            <button @click="openBlueprint()" class="btn btn-secondary me-0">
                Load Blueprint
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";
import ModalsManager from "@/components/Modals/Modals";
import { ipcRenderer } from "electron";

@Options({
    components: {}
})
export default class EditorOtherTab extends Vue {
    openSettings() {
        ipcRenderer.send("setModalVisibility", {
            name: "Settings",
            state: true
        });
    }

    openBlueprint() {
        ipcRenderer.send("setModalVisibility", {
            name: "Blueprint",
            state: true
        });
    }
}
</script>

<style></style>
