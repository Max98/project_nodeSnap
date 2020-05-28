<template>
    <div>
        <b-container>
            <b-row class="h-100">
                <b-col class="my-auto">
                    <b-form @submit.prevent="next" ref="form">
                        <b-card
                            class="mx-auto project-card"
                            header="New project"
                            header-class="project-header-class"
                        >
                            <b-form-group
                                label="Vehicle type"
                                description="Vehicle type, ground vehicle, plane, boat, etc.."
                            >
                                <b-form-select
                                    v-model="selectedTypeValue"
                                    :options="truckTypesArray"
                                ></b-form-select>
                            </b-form-group>
                            <b-form-group
                                label="Title"
                                label-for="input-title"
                                description="Vehicle name"
                            >
                                <b-form-input id="input-title" required v-model="truckTitle"></b-form-input>
                            </b-form-group>
                            <b-row>
                                <b-col>
                                    <b-form-group
                                        label="Total mass"
                                        label-for="input-mass"
                                        description="Total vehicle mass"
                                    >
                                        <b-form-input
                                            id="input-mass"
                                            required
                                            type="number"
                                            v-model="dryMass"
                                        ></b-form-input>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group
                                        label="Load mass"
                                        label-for="input-Load"
                                        description="a.k.a Cargo mass, used to average 'l' optioned nodes mass"
                                    >
                                        <b-form-input
                                            id="input-Load"
                                            type="number"
                                            required
                                            v-model="cargoMass"
                                        ></b-form-input>
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <b-form-group
                                label="File format version"
                                description="You should leave this as it is, unless you know what you are doing"
                            >
                                <b-form-select
                                    v-model="selectedFileFormatValue"
                                    :options="fileFormatArray"
                                ></b-form-select>
                            </b-form-group>
                            <b-form-group label="Category" description="What's your vehicle?">
                                <b-form-select
                                    v-model="selectedCategoryValue"
                                    :options="categoryArray"
                                ></b-form-select>
                            </b-form-group>

                            <template v-slot:footer>
                                <b-button type="submit" variant="success">Create</b-button>
                                <b-button @click="$router.push('/')" variant="secondary">Cancel</b-button>
                            </template>
                        </b-card>
                    </b-form>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
    name: "",
    components: {}
})
export default class ComponentName extends Vue {
    private truckTitle = "My new truck";
    private dryMass = 10000.0;
    private cargoMass = 1000.0;

    private selectedTypeValue = "";

    private truckTypesArray = [
        { value: "", text: "Truck/Car" },
        { value: "", text: "Boat" },
        { value: "", text: "Plane" },
        { value: "", text: "Train" },
        { value: "", text: "Load" }
    ];

    private selectedFileFormatValue = "3";

    private fileFormatArray = [
        { value: "1", text: "fileformatversion 1" },
        { value: "2", text: "fileformatversion 2" },
        { value: "3", text: "fileformatversion 3" }
    ];

    private selectedCategoryValue = "108";

    private categoryArray = [
        { value: "108", text: "Other Land Vehicles" },
        { value: "146", text: "Street Cars" },
        { value: "147", text: "Light Racing Cars" }
    ];

    next() {
        console.log("next");
        this.$store.dispatch("setTruckInfo", {
            title: this.truckTitle,
            cargoMass: this.cargoMass,
            dryMass: this.dryMass,
            material: ""
        });
        this.$router.push("/editor");
    }
}
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;
}

.project-card {
    width: 800px;
    height: 680px;
}
.project-header-class {
    font-size: 1.7rem;
    font-weight: bold;
    color: white;
}
</style>
