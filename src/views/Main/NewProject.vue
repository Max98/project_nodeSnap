<template>
    <div class="container">
        <div class="row h-100">
            <div class="col my-auto">
                <div class="card mx-auto project-card">
                    <div class="card-header">
                        <h3 class="card-title project-header-class">
                            New project:
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Title</label>
                            <input
                                type="text"
                                class="form-control"
                                v-model="truckTitle"
                            />
                            <div class="form-text">
                                Vehicle name.
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <label class="form-label">Total mass</label>
                                <input
                                    type="number"
                                    class="form-control"
                                    v-model="dryMass"
                                />
                                <div class="form-text">
                                    Total vehicle mass, in kg.
                                </div>
                            </div>
                            <div class="col">
                                <label class="form-label">Load mass</label>
                                <input
                                    type="number"
                                    class="form-control"
                                    v-model="cargoMass"
                                />
                                <div class="form-text">
                                    a.k.a Cargo mass, used to average 'l'
                                    optioned nodes mass, in kg.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="float-end">
                            <button class="btn btn-danger" @click="cancel()">
                                Cancel
                            </button>
                            <button class="btn btn-success" @click="next()">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "@/components/Editor/TruckEditorManagaer";

interface CurrentProject {
    title: string;
}

@Options({
    components: {}
})
export default class Projects extends Vue {
    private truckTitle = "My new truck";
    private dryMass = 10000.0;
    private cargoMass = 1000.0;

    next() {
        TruckEditorManager.getInstance()
            .getEditorObj()
            .create(this.truckTitle, this.dryMass, this.cargoMass);
        this.$router.push("/editor");
    }

    cancel() {
        this.$router.push("/");
    }
}
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;
}

.project-card {
    width: 800px;
    height: 600px;
}

.project-header-class {
    font-size: 1.7rem;
    font-weight: bold;
    color: white;
}

.text-projects-info {
    color: rgb(163, 163, 163);
}
.reset-projects {
    font-size: 14px;
    margin-top: 10px;
}

.projects-array-scroll {
    overflow: auto;
    max-height: 460px;
}
</style>
