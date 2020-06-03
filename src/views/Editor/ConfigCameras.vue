<template>
    <div>
        <b-modal
            id="modal-configCameras"
            title="BootstrapVue"
            @ok="process"
            cancel-title="Cancel"
            body-bg-variant="dark"
            header-bg-variant="dark"
            footer-bg-variant="dark"
            header-border-variant="dark"
            footer-border-variant="dark"
            size="lg"
        >
            <b-form>
                <h4>Thrid view camera</h4>
                <b-row>
                    <b-col>
                        <b-form-group label="Center node">
                            <b-form-input v-model="cameras.centerNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Back node">
                            <b-form-input v-model="cameras.backNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Left node">
                            <b-form-input v-model="cameras.leftNode"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-form>
            <b-form>
                <h4>Cinecam</h4>
                <b-row>
                    <b-col>
                        <b-form-group label="X">
                            <b-form-input v-model="cinecam.x"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Y">
                            <b-form-input v-model="cinecam.y"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Z">
                            <b-form-input v-model="cinecam.z"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Node 1">
                            <b-form-input v-model="cinecam.node1"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 2">
                            <b-form-input v-model="cinecam.node2"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 3">
                            <b-form-input v-model="cinecam.node3"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 4">
                            <b-form-input v-model="cinecam.node4"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 5">
                            <b-form-input v-model="cinecam.node5"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 6">
                            <b-form-input v-model="cinecam.node6"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 7">
                            <b-form-input v-model="cinecam.node7"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 8">
                            <b-form-input v-model="cinecam.node8"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </b-form>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, PropSync } from "vue-property-decorator";

import EditorComponent from "./class";
import * as TRUCK from "../../components/Editor/ts/TruckFileParser";
import { watch } from "fs";

@Component({
    name: "",
    components: {}
})
export default class ConfigCameras extends EditorComponent {
    /**
     * Init some stuff if new truck
     */
    private cameras: TRUCK.TruckFileCameras = {
        centerNode: "0",
        backNode: "1",
        leftNode: "2"
    };

    private cinecam: TRUCK.TruckFileCineCam = {
        x: 0,
        y: 0,
        z: 0,
        node1: "0",
        node2: "1",
        node3: "2",
        node4: "3",
        node5: "4",
        node6: "5",
        node7: "6",
        node8: "7"
    };

    created() {
        this.init();
        console.log("this init");
        this.load();
    }

    @Watch("getTruckData")
    update() {
        this.load();
    }

    load() {
        if (this.getTruckData.cameras != undefined) {
            this.cameras = {
                centerNode: this.$store.getters.getNodeRealId(
                    this.getTruckData.cameras.centerNode
                ),
                backNode: this.$store.getters.getNodeRealId(
                    this.getTruckData.cameras.backNode
                ),
                leftNode: this.$store.getters.getNodeRealId(
                    this.getTruckData.cameras.leftNode
                )
            };
        }

        if (this.getTruckData.cineCam != undefined) {
            this.cinecam = {
                x: this.getTruckData.cineCam.x,
                y: this.getTruckData.cineCam.y,
                z: this.getTruckData.cineCam.z,
                node1: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node1
                ),
                node2: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node2
                ),
                node3: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node3
                ),
                node4: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node4
                ),
                node5: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node5
                ),
                node6: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node6
                ),
                node7: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node7
                ),
                node8: this.$store.getters.getNodeRealId(
                    this.getTruckData.cineCam.node8
                )
            };
        }
    }

    process() {
        this.$store.dispatch("setTruckCameras", {
            cameras: this.cameras,
            cineCam: this.cinecam
        });
    }
}
</script>

<style lang="scss" scoped></style>
