<template>
    <div>
        <b-modal
            id="modal-configWheels"
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
                <div v-for="(wheel, idx) in wheels" :key="idx">
                    <b-row @click="setSelectedWheel(wheel)">
                        <b-col>
                            Wheel {{ idx + 1 }}, node1: {{ wheel.node1 }},
                            node2: {{ wheel.node2 }}
                        </b-col>
                    </b-row>
                </div>
            </div>
            <div v-if="selectedWheel">
                <b-row>
                    <b-col>
                        <b-form-group label="Mass">
                            <b-form-input
                                v-model="selectedWheel.mass"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="radius">
                            <b-form-input
                                v-model="selectedWheel.radius"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Number of rays">
                            <b-form-input
                                v-model="selectedWheel.numRays"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Node 1">
                            <b-form-input
                                v-model="selectedWheel.node1"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Node 2">
                            <b-form-input
                                v-model="selectedWheel.node2"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Rigidity Node">
                            <b-form-input
                                v-model="selectedWheel.rigNode"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Reference arm node">
                            <b-form-input
                                v-model="selectedWheel.refArmNode"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Wheel springiness">
                            <b-form-input
                                v-model="selectedWheel.springness"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Wheel damping">
                            <b-form-input
                                v-model="selectedWheel.damping"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <b-form-group label="Wheel braking">
                            <b-form-input
                                v-model="selectedWheel.braking"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Wheel drive">
                            <b-form-input
                                v-model="selectedWheel.drive"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Material">
                            <b-form-input
                                v-model="selectedWheel.material"
                            ></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
            </div>
            <b-button @click="addNewWheel">Add</b-button>
        </b-modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import * as TRUCK from "../../components/Editor/ts/TruckFileParser";
import * as TruckEditor from "../../components/Editor/ts/TruckEditor";

@Component({
    name: "",
    components: {}
})
export default class ConfigWheels extends Vue {
    private get getTruckData() {
        return this.$store.getters.getTruckData;
    }
    @Prop(TruckEditor.default) readonly EditorObj!: TruckEditor.default;

    private selectedWheel: TRUCK.TruckFileWheels | null = null;

    private wheels: TRUCK.TruckFileWheels[] = [];

    @Watch("getTruckData")
    update() {
        this.load();
    }

    setSelectedWheel(wheel: TRUCK.TruckFileWheels) {
        this.selectedWheel = wheel;
    }

    created() {
        this.load();
    }

    load() {
        this.wheels = [];

        if (this.getTruckData.wheels) {
            //@ts-ignore
            this.getTruckData.wheels.forEach(element => {
                this.wheels.push({
                    mass: element.mass,
                    width: element.width,
                    radius: element.radius,
                    numRays: element.numRays,
                    node1: this.$store.getters.getNodeRealId(element.node1),
                    node2: this.$store.getters.getNodeRealId(element.node2),
                    rigNode: element.rigNode,
                    refArmNode: element.refArmNode,
                    springness: element.springness,
                    damping: element.damping,
                    braking: element.braking,
                    drive: element.drive,
                    material: element.material
                });
            });
        }
    }

    addNewWheel() {
        this.wheels.push({
            mass: 280,
            width: 0,
            radius: 0.5,
            numRays: 16,
            node1: "0",
            node2: "1",
            rigNode: "9999",
            refArmNode: "0",
            springness: 800000,
            damping: 4000,
            braking: 1,
            drive: 0,
            material: "tracks/wheelface tracks/wheelband1"
        });
        this.setSelectedWheel(this.wheels[this.wheels.length - 1]);
    }

    process() {
        console.log();
        this.$store.dispatch("setTruckWheels", { wheels2: this.wheels });
        this.EditorObj.updateWheels();
    }
}
</script>

<style lang="scss" scoped></style>
