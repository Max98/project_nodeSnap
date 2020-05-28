import Store from "electron-store";

export interface LatestProjectsArray {
    title: string;
    path: string;
}

export class LatestProjects {
    store: Store;
    latestProjects: LatestProjectsArray[] = [];

    constructor() {
        this.store = new Store();

        if (this.store.get("projects.latestProjects"))
            this.latestProjects = this.store.get("projects.latestProjects");
    }

    /**
     * get all projects
     */
    getLatestProjects(): LatestProjectsArray[] {
        return this.latestProjects;
    }

    /**
     * Add a new project
     * @param project data
     */
    pushProject(project: LatestProjectsArray) {
        this.latestProjects = this.latestProjects.filter(
            el => el.title != project.title
        );

        this.latestProjects.unshift(project);

        this.store.set("projects.latestProjects", this.latestProjects);
    }

    /**
     * Delete everything
     */
    flush() {
        this.latestProjects = [];
        this.store.set("projects.latestProjects", this.latestProjects);
    }
}
