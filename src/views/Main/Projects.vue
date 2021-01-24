<template>
    <div class="container">
        <div class="row h-100">
            <div class="col my-auto">
                <div class="card mx-auto project-card">
                    <div class="card-header">
                        <h3 class="card-title project-header-class">
                            rorEditor Projects:
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-8">
                                <h3>
                                    Latest projects
                                    <small class="float-end reset-projects">
                                        <a
                                            v-on:click.prevent="
                                                resetProjectsList
                                            "
                                            href=""
                                            >reset</a
                                        >
                                    </small>
                                </h3>
                                <div class="projects-array-scroll">
                                    <div
                                        class="list-group "
                                        v-for="(project,
                                        index) in latestProjectsArray"
                                        :key="index"
                                    >
                                        <a
                                            href="#"
                                            class="list-group-item list-group-item-action"
                                            @click.prevent="
                                                loadProject(project)
                                            "
                                        >
                                            {{ project.title }}&nbsp;
                                            <small class="text-projects-info">
                                                {{ " : " + project.path }}
                                            </small>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <h3>Actions</h3>
                                <div>
                                    <div class="card bg-secondary">
                                        <div class="card-body">
                                            <p>
                                                <a
                                                    @click.prevent="newFile"
                                                    href=""
                                                    >New File</a
                                                >
                                            </p>
                                            <p>
                                                <a
                                                    @click.prevent="openFile"
                                                    href=""
                                                    >Open file</a
                                                >
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="currProject.title != ''" class="card-footer">
                        Current project:
                        <b style="color: white">{{ currProject.title }}</b>
                        <div class="float-end">
                            <router-link to="/editor"
                                >Go back to editor <BIconArrowRightShort
                            /></router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";

const remote = require("electron").remote;
const { dialog } = remote;

import {
    LatestProjectsArray,
    LatestProjects
} from "@/components/Editor/ts/LatestProjects";

interface CurrentProject {
    title: string;
}

@Options({
    components: {}
})
export default class Projects extends Vue {
    latestProjects!: LatestProjects;
    latestProjectsArray: LatestProjectsArray[] = [];
    private currProject: CurrentProject = { title: "" };

    created() {
        this.latestProjects = new LatestProjects();
        this.latestProjectsArray = this.latestProjects.getLatestProjects();
    }

    mounted() {
        if (
            TruckEditorManager.getInstance()
                .getEditorObj()
                .getData().title
        ) {
            this.currProject.title = TruckEditorManager.getInstance()
                .getEditorObj()
                .getData().title;
        }
    }

    resetProjectsList() {
        dialog
            .showMessageBox({
                title: "Confirmation",
                type: "warning",
                buttons: ["Yes", "Cancel"],
                defaultId: 1,
                cancelId: 1,
                message:
                    "Are you sure to reset projects history? This will not delete anything."
            })
            .then((data: { response: number; checkboxCheck: boolean }) => {
                if (data.response == 0) {
                    this.latestProjects.flush();
                    this.latestProjectsArray = this.latestProjects.getLatestProjects();
                }
            });
    }

    checkBeforeOpen() {
        if (this.currProject.title != "") {
            const bl = dialog.showMessageBoxSync({
                title: "Confirmation",
                type: "warning",
                buttons: ["Yes", "Cancel"],
                defaultId: 1,
                cancelId: 1,
                message:
                    "You have an open project, did you save it? You will lose all your work if you continue. \nAre you sure?"
            });

            if (bl == 1) {
                return false;
            } else {
                this.currProject.title = "";
            }

            return true;
        }
    }

    openFile() {
        if (this.checkBeforeOpen() == false) return;

        dialog
            .showOpenDialog(remote.getCurrentWindow(), {
                title: "Open truck file",
                multiSelections: false,
                openFile: true,
                filters: [
                    {
                        name: "Truck file",
                        extensions: [
                            "truck",
                            "car",
                            "airplane",
                            "load",
                            "boat",
                            "train",
                            "machine",
                            "trailer",
                            "fixed"
                        ]
                    }
                ]
            })
            .then((data: { canceled: boolean; filePaths: string[] }) => {
                this.loadProject({ title: "newFile", path: data.filePaths[0] });
            });
    }

    newFile() {
        if (this.checkBeforeOpen() == false) return;

        this.$router.push("/New");
    }

    loadProject(project: LatestProjectsArray) {
        if (project.title == this.currProject.title) {
            this.$router.push("/editor");
            return;
        }

        if (this.checkBeforeOpen() == false) return;

        const data = TruckEditorManager.getInstance().loadFile(project.path);

        this.$store.dispatch("setTruckFilePath", project.path);

        this.latestProjects.pushProject({
            title: data,
            path: project.path
        });

        this.latestProjectsArray = this.latestProjects.getLatestProjects();

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
