<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { ipcRenderer } from "electron";

export default class Modals extends Vue {
    mounted() {
        /* ipcRenderer.on("SET_NAME", (event, arg) => {
            console.log(arg.name);
        });*/
    }
}
</script>

<style></style>
