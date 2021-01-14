<template>
    <div>
        <b-container>
            <b-row class="h-100">
                <b-col class="my-auto">
                    <b-card
                        class="mx-auto project-card"
                        header="rorEditor Projects:"
                        header-class="project-header-class"
                    >
                        <b-row>
                            <b-col cols="8">
                                <h3>
                                    Latest projects
                                    <small class="float-right reset-projects">
                                        <b-link
                                            v-on:click.prevent="
                                                resetProjectsList
                                            "
                                            >reset</b-link
                                        >
                                    </small>
                                </h3>
                                <div class="projects-array-scroll">
                                    <b-list-group
                                        v-for="(project,
                                        index) in latestProjectsArray"
                                        :key="index"
                                    >
                                        <b-list-group-item
                                            href="#"
                                            class="project_list"
                                            @click="loadProject(project)"
                                        >
                                            {{ project.title }}&nbsp;
                                            <small class="text-projects-info">
                                                {{ " : " + project.path }}
                                            </small>
                                        </b-list-group-item>
                                    </b-list-group>
                                </div>
                            </b-col>
                            <b-col>
                                <h3>Actions</h3>
                                <div>
                                    <b-card bg-variant="secondary">
                                        <p>
                                            <b-link @click="newFile"
                                                >New file</b-link
                                            >
                                        </p>
                                        <p>
                                            <b-link @click="openFile"
                                                >Open file</b-link
                                            >
                                        </p>
                                    </b-card>
                                </div>
                            </b-col>
                        </b-row>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import truckParser from "../components/Editor/ts/TruckFileParser2";
import fileDialog from "file-dialog";

import { remote } from "electron";
import {
    LatestProjectsArray,
    LatestProjects
} from "@/components/Editor/ts/LatestProjects";

@Component({
    name: "",
    components: {}
})
export default class Projects extends Vue {
    private projectsArray: any[] = [
        { id: 1, title: "$truck_name : $truck_file_patch" }
    ];

    latestProjects!: LatestProjects;
    latestProjectsArray: LatestProjectsArray[] = [];

    created() {
        this.latestProjects = new LatestProjects();
        this.latestProjectsArray = this.latestProjects.getLatestProjects();
    }

    resetProjectsList() {
        this.$bvModal
            .msgBoxConfirm(
                "Are you sure to reset projects history? This will not delete anything.",
                {
                    title: "Confirmation",
                    size: "sm",
                    headerBgVariant: "danger",
                    headerTextVariant: "white",
                    bodyBgVariant: "dark",
                    okTitle: "Delete",
                    footerBgVariant: "dark",
                    buttonSize: "sm",
                    okVariant: "danger",
                    headerClass: "p-2 border-bottom-0",
                    footerClass: "p-2 border-top-0",
                    centered: true
                }
            )
            .then(value => {
                if (value) {
                    this.latestProjects.flush();
                    this.latestProjectsArray = this.latestProjects.getLatestProjects();
                }
            })
            .catch(err => {
                // An error occurred
            });
    }

    openFile() {
        fileDialog({ multiple: false }).then(file => {
            this.loadProject({ title: "", path: file[0].path });
        });
    }

    newFile() {
        this.$router.push("/new/0");
    }

    loadProject(project: LatestProjectsArray) {
        const mytruckParser = new truckParser();
        const split = project.path.split(".");
        const fileExt = split[split.length - 1].toLowerCase();

        if (!fileExt.startsWith("truck") && !fileExt.startsWith("airplane")) {
            this.$bvToast.toast("File format incorrect", {
                title: `Error`,
                variant: "danger",
                solid: true
                //noAutoHide: true
            });
            return;
        }

        if (mytruckParser.loadFile(project.path)) {
            //console.log(this.$store.getters.getTruckData);

            this.latestProjects.pushProject({
                title: this.$store.getters.getTruckData.title,
                path: project.path
            });
            this.latestProjectsArray = this.latestProjects.getLatestProjects();

            this.$store.dispatch("setTruckFilePath", project.path);

            this.$router.push("/editor?load=true");
        }
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
