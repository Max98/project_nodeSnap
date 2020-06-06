<template>
    <div>
        <b-modal
            id="modal-configWheels2"
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
            <div class="wheels-list">
                <div v-for="(wheel, idx) in wheels2" :key="idx">
                    <b-row @click="setSelectedWheel2(wheel)">
                        <b-col>
                            Wheel {{ idx + 1 }}, node1: {{ wheel.node1 }},
                            node2: {{ wheel.node2 }}
                        </b-col>
                    </b-row>
                </div>
            </div>
            <div v-if="selectedWheel2">
                <b-row>
                    <b-col>
                        <b-form-group label="Mass">
                            <b-form-input
                                v-model="selectedWheel2.mass"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim radius">
                            <b-form-input
                                v-model="selectedWheel2.rimRadius"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Tyre radius">
                            <b-form-input
                                v-model="selectedWheel2.tyreRadius"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>

                    <b-col>
                        <b-form-group label="Number of rays">
                            <b-form-input
                                v-model="selectedWheel2.numRays"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Node 1">
                            <b-form-input
                                v-model="selectedWheel2.node1"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 2">
                            <b-form-input
                                v-model="selectedWheel2.node2"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rigidity Node">
                            <b-form-input
                                v-model="selectedWheel2.rigNode"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Reference arm node">
                            <b-form-input
                                v-model="selectedWheel2.refArmNode"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Tyre Springiness">
                            <b-form-input
                                v-model="selectedWheel2.tyreSpringness"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Tyre Damping">
                            <b-form-input
                                v-model="selectedWheel2.tyreDamping"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim springiness">
                            <b-form-input
                                v-model="selectedWheel2.rimSpringness"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rim damping">
                            <b-form-input
                                v-model="selectedWheel2.rimDamping"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Wheel braking">
                            <b-form-input
                                v-model="selectedWheel2.braking"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Wheel drive">
                            <b-form-input
                                v-model="selectedWheel2.drive"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Material">
                            <b-form-input
                                v-model="selectedWheel2.material"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </div>
            <b-button @click="addNewWheel2">Add</b-button>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import EditorComponent from "./class";
import * as TRUCK from "../../components/Editor/ts/TruckFileParser";

@Component({
    name: "",
    components: {}
})
export default class ConfigWheels2 extends EditorComponent {
    private selectedWheel2: TRUCK.TruckFileWheels2 | null = null;

    private wheels2: TRUCK.TruckFileWheels2[] = [];

    @Watch("getTruckData")
    update() {
        this.load();
    }

    setSelectedWheel2(wheel: TRUCK.TruckFileWheels2) {
        this.selectedWheel2 = wheel;
    }

    created() {
        this.init();
        this.load();
    }

    load() {
        this.wheels2 = [];

        if (this.getTruckData.wheels2) {
            //@ts-ignore
            this.getTruckData.wheels2.forEach(element => {
                this.wheels2.push({
                    mass: element.mass,
                    width: element.width,
                    rimRadius: element.rimRadius,
                    tyreRadius: element.tyreRadius,
                    numRays: element.numRays,
                    node1: this.$store.getters.getNodeRealId(element.node1),
                    node2: this.$store.getters.getNodeRealId(element.node2),
                    rigNode: element.rigNode,
                    refArmNode: element.refArmNode,
                    tyreSpringness: element.tyreSpringness,
                    tyreDamping: element.tyreDamping,
                    rimSpringness: element.rimSpringness,
                    rimDamping: element.rimDamping,
                    braking: element.braking,
                    drive: element.drive,
                    material: element.material
                });
            });
        }
    }

    addNewWheel2() {
        this.wheels2.push({
            mass: 280,
            width: 0,
            rimRadius: 0.3,
            tyreRadius: 0.6,
            numRays: 16,
            node1: "0",
            node2: "1",
            rigNode: "9999",
            refArmNode: "0",
            tyreSpringness: 400000,
            tyreDamping: 2000,
            rimSpringness: 900000,
            rimDamping: 200,
            braking: 1,
            drive: 0,
            material: "tracks/daffwheelface tracks/dafwheelband"
        });
        this.setSelectedWheel2(this.wheels2[this.wheels2.length - 1]);
    }

    process() {
        console.log();
        this.$store.dispatch("setTruckWheels2", { wheels2: this.wheels2 });
        this.EditorObj.updateWheels();
    }
}
</script>

<style lang="scss" scoped></style>
