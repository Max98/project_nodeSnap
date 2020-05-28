import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Projects from "../views/Projects.vue";
import Editor from "../views/Editor.vue";
import InitProject from "../views/InitProject.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: "/",
        name: "Projects",
        component: Projects
    },
    {
        path: "/Editor",
        name: "Editor",
        component: Editor
    },
    {
        path: "/new/:step",
        name: "newProject",
        component: InitProject
    }
];

const router = new VueRouter({
    routes
});

export default router;
