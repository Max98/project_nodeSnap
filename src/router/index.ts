import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

import Projects from "../views/Main/Projects.vue";
import NewProject from "../views/Main/NewProject.vue";
import Editor from "../views/Main/Editor.vue";
import Modals from "../views/Modals/Modals.vue";
import Settings from "../views/Modals/Settings.vue";
import RenameGrp from "../views/Modals/Groups/RenameGrp.vue";
import AddGrp from "../views/Modals/Groups/AddGrp.vue";
import DuplicateGrp from "../views/Modals/Groups/DuplicateGrp.vue";
import Blueprint from "../views/Modals/Blueprint.vue";

const routes: Array<RouteRecordRaw> = [
    /**
     * Main pages
     */
    {
        path: "/",
        name: "Projects",
        component: Projects
    },
    {
        path: "/New",
        name: "NewProject",
        component: NewProject
    },
    {
        path: "/Editor",
        name: "Editor",
        component: Editor
    },

    /**
     * Modals, that will be open in an other renderer page using electron
     */
    {
        path: "/Modals",
        name: "Modals",
        component: Modals,
        children: [
            /**
             * Settings
             */
            {
                path: "Settings",
                component: Settings
            },
            /**
             * Groups
             */
            {
                path: "Groups/Rename",
                component: RenameGrp
            },
            {
                path: "Groups/Add",
                component: AddGrp
            },
            {
                path: "Groups/Duplicate",
                component: DuplicateGrp
            },
            /**
             * Blueprint
             */
            {
                path: "Blueprint",
                component: Blueprint
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
