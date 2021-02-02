<template>
    <router-view />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";
import { Watch } from "@/components/vue-decorator";
import { ipcRenderer } from "electron";

export default class Main extends Vue {}
</script>

<style lang="scss"></style>
