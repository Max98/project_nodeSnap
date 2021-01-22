<template>
    <div>
        <div class="d-grid gap-2">
            <button @click="openSettings()" class="btn btn-secondary me-0">
                Settings
            </button>
            <button @click="toast()" class="btn btn-secondary me-0">
                Toast
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";
import ModalsManager from "@/components/Modals/Modals";
import { ipcRenderer } from "electron";
import { useToast } from "vue-toastification";

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

    toast() {
        useToast()("Default");
        useToast().info("Info");
        useToast().success("Succ");
        useToast().error("Err");
        useToast().warning("Warning");
    }
}
</script>

<style></style>
