<template>
    <div class="row body_row">
        <div class="col side_bar_col">
            <div class="card sidebar_menu_card">
                <div class="sidebar_header">
                    <p
                        style="padding: 5px 20px; font-size: 20px; color: white; text-align: center;"
                    >
                        nodeSnap
                    </p>
                </div>
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link active"
                            id="nodes-tab"
                            data-bs-toggle="tab"
                            role="tab"
                            href="#nodes"
                            >Nodes</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="beams-tab"
                            data-bs-toggle="tab"
                            role="tab"
                            href="#beams"
                            >Beams</a
                        >
                    </li>
                    <li class="nav-item" role="presentation">
                        <a
                            class="nav-link"
                            id="other-tab"
                            data-bs-toggle="tab"
                            role="tab"
                            href="#other"
                            >Other</a
                        >
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">
                    <!-- Nodes tab !-->
                    <div
                        class="tab-pane fade show active"
                        id="nodes"
                        role="tabpanel"
                    >
                        <EditorNodesTab
                            v-bind:truckDataNodes="truckDataNodes"
                            v-bind:truckDataGroups="truckDataGroups"
                        />
                    </div>

                    <!-- Beams tab !-->
                    <div class="tab-pane fade" id="beams" role="tabpanel">
                        <EditorBeamsTab
                            v-bind:truckDataBeams="truckDataBeams"
                            v-bind:truckDataGroups="truckDataGroups"
                        />
                    </div>

                    <!-- Other tab !-->
                    <div class="tab-pane fade" id="other" role="tabpanel">
                        <EditorOtherTab />
                    </div>
                </div>
            </div>
        </div>
        <div class="col body_col">
            <EditorNavBar />
            <EditorMain />
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Watch } from "@/components/vue-decorator";
import EditorNodesTab from "./Editor/RoR/Editor_nodesTab.vue";
import EditorBeamsTab from "./Editor/RoR/Editor_beamsTab.vue";
import EditorOtherTab from "./Editor/RoR//Editor_otherTab.vue";
import EditorNavBar from "./Editor/RoR/Editor_navbar.vue";
import EditorMain from "./Editor/Editor_main.vue";
import TruckEditorManager from "@/components/Editor/ts/TruckEditorManagaer";

@Options({
    name: "Editor",
    components: {
        EditorNodesTab,
        EditorBeamsTab,
        EditorOtherTab,
        EditorNavBar,
        EditorMain
    }
})
export default class Editor extends Vue {
    truckDataNodes = JSON.parse(
        JSON.stringify(
            TruckEditorManager.getInstance()
                .getEditorObj()
                .getData().nodes
        )
    );

    truckDataBeams = JSON.parse(
        JSON.stringify(
            TruckEditorManager.getInstance()
                .getEditorObj()
                .getData().beams
        )
    );

    truckDataGroups = JSON.parse(
        JSON.stringify(
            TruckEditorManager.getInstance()
                .getEditorObj()
                .getData().groups
        )
    );

    loadData() {
        this.truckDataNodes = JSON.parse(
            JSON.stringify(
                TruckEditorManager.getInstance()
                    .getEditorObj()
                    .getData().nodes
            )
        );
        this.truckDataBeams = JSON.parse(
            JSON.stringify(
                TruckEditorManager.getInstance()
                    .getEditorObj()
                    .getData().beams
            )
        );
        this.truckDataGroups = JSON.parse(
            JSON.stringify(
                TruckEditorManager.getInstance()
                    .getEditorObj()
                    .getData().groups
            )
        );
    }

    created() {
        this.loadData();
        document.addEventListener("truckDataUpdate", () => {
            this.loadData();
        });
    }
}
</script>

<style lang="scss">
@import "~@/sass/var";

.grp-row {
    background-color: #3d0155;
}

.body_row {
    margin-right: 0 !important;
}
.body_col {
    padding: 0 !important;
}

.sidebar_menu_card {
    height: 100%;
    min-height: 100vh;
    max-height: 100vh;
    border: 0 !important;
    box-shadow: 5px 0px 5px rgba(0, 0, 0, 0.082);
    z-index: 10;
}

.sidebar_header {
    height: 40px;
    background-color: $primary;
    //margin-bottom: 10px;
}

.card_body_sidebar_avatar {
    padding: 1.25rem;
    padding-bottom: 0.5rem;
}

.sidebar_avatar p {
    padding-left: 10px;
    display: inline-block;
}

.sidebar_nav {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
}

.nav-tabs {
    background-color: $primary;
}

.node-table {
    overflow: auto !important;
    min-height: calc(100vh - 64px - 160px);
    max-height: calc(100vh - 64px - 160px);

    .row {
        margin: 0;
        padding: 0px 5px;
        .col {
            padding-right: 0;
            padding-left: 10px;
            overflow: hidden;
            //max-width: 7ch;
        }
        &:hover {
            background-color: $secondary;
            color: white;
        }
    }

    .active {
        background-color: $primary;
        color: white;
    }
}

.sidebar-editor {
    min-height: 148.81px;
    .card-body {
        padding: 0.5rem 1rem 0.5rem 1rem;
    }
}

.wheels-list {
    height: 200px;
    .row {
        color: white;
        background-color: $secondary;
        &:hover {
            background-color: $primary;
        }
    }
}
</style>

<style lang="scss" scoped>
.row-editor {
    margin-bottom: 0px;
}

canvas:focus {
    outline: none;
}
</style>
