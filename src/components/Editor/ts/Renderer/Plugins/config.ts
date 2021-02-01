import fs from "fs";
import path from "path";
import store from "@/store/index";
import TruckEditorManager from "../../TruckEditorManagaer";
import { useToast } from "vue-toastification";
import * as Logger from "electron-log";

interface ConfigData {
    name: string;
    data: {
        gridSize: number;
        nodeSize: number;
        displayNodesName: boolean;
        blueprint?: {
            filePath: string;
            opacity: number;
            visible: boolean;
            pos1: number[];
            pos2: number[];
            pos3: number[];

            rot1: number[];
            rot2: number[];
            rot3: number[];

            scale1: number[];
            scale2: number[];
            scale3: number[];
        };
        bluemodel?: {
            filePath: string;
            opacity: number;
            visible: boolean;
            pos: number[];
            rot: number[];
            scale: number[];
        };
    };
}

export default class Config {
    private projectConfig: ConfigData;
    private folderPath = "";
    private truckFileName = "";
    private logger: Logger.LogFunctions;

    constructor() {
        this.logger = Logger.default.scope("sceneConfig");
        /**
         * TODO: maybe store this in TruckEditor.ts instead of vuex?
         */

        this.projectConfig = {
            name: "",
            data: {
                gridSize: 1,
                nodeSize: 1,
                displayNodesName: false
            }
        };
    }

    saveConfig(filePath: string) {
        if (filePath == "") return;

        this.folderPath = filePath;
        const split = this.folderPath.split("\\");
        this.folderPath = this.folderPath
            .replace(split[split.length - 1], "") //remove .truck file and get folder path
            .slice(0, -1); //remove the last \

        let configData: ConfigData[];

        if (fs.existsSync(this.folderPath + "/.nodeSnap/config.json")) {
            const parser = fs
                .readFileSync(
                    this.folderPath + "/.nodeSnap/config.json",
                    "utf8"
                )
                .toString();

            configData = JSON.parse(parser);
        } else {
            configData = [];
        }

        /**
         * TODO: see TODO on constructor
         */
        const settings: {
            nodesSpriteScale: number;
            gridSize: number;
            displayNodesName: boolean;
        } = store.getters.getSettings;

        this.projectConfig.data = {
            gridSize: settings.gridSize,
            nodeSize: settings.nodesSpriteScale,
            displayNodesName: settings.displayNodesName
        };

        const tM: TruckEditorManager = TruckEditorManager.getInstance();

        const bluePrintSystem = tM
            .getRendererObj()
            .getSceneController()
            .getBlueprintSystem();

        if (bluePrintSystem.getBlueprints().length != 0) {
            //this is such a mess

            this.projectConfig.data.blueprint = {
                filePath: bluePrintSystem.getBlueprintFilePath(),
                opacity: (bluePrintSystem.getBlueprints()[0].model
                    .material as THREE.MeshBasicMaterial).opacity,
                visible: bluePrintSystem.getBlueprints()[0].model.visible,
                pos1: [
                    bluePrintSystem.getBlueprints()[0].model.position.x,
                    bluePrintSystem.getBlueprints()[0].model.position.y,
                    bluePrintSystem.getBlueprints()[0].model.position.z
                ],
                rot1: [
                    bluePrintSystem.getBlueprints()[0].model.rotation.x,
                    bluePrintSystem.getBlueprints()[0].model.rotation.y,
                    bluePrintSystem.getBlueprints()[0].model.rotation.z
                ],
                scale1: [
                    bluePrintSystem.getBlueprints()[0].model.scale.x,
                    bluePrintSystem.getBlueprints()[0].model.scale.y,
                    bluePrintSystem.getBlueprints()[0].model.scale.z
                ],

                pos2: [
                    bluePrintSystem.getBlueprints()[1].model.position.x,
                    bluePrintSystem.getBlueprints()[1].model.position.y,
                    bluePrintSystem.getBlueprints()[1].model.position.z
                ],
                rot2: [
                    bluePrintSystem.getBlueprints()[1].model.rotation.x,
                    bluePrintSystem.getBlueprints()[1].model.rotation.y,
                    bluePrintSystem.getBlueprints()[1].model.rotation.z
                ],
                scale2: [
                    bluePrintSystem.getBlueprints()[1].model.scale.x,
                    bluePrintSystem.getBlueprints()[1].model.scale.y,
                    bluePrintSystem.getBlueprints()[1].model.scale.z
                ],

                pos3: [
                    bluePrintSystem.getBlueprints()[2].model.position.x,
                    bluePrintSystem.getBlueprints()[2].model.position.y,
                    bluePrintSystem.getBlueprints()[2].model.position.z
                ],
                rot3: [
                    bluePrintSystem.getBlueprints()[2].model.rotation.x,
                    bluePrintSystem.getBlueprints()[2].model.rotation.y,
                    bluePrintSystem.getBlueprints()[2].model.rotation.z
                ],
                scale3: [
                    bluePrintSystem.getBlueprints()[2].model.scale.x,
                    bluePrintSystem.getBlueprints()[2].model.scale.y,
                    bluePrintSystem.getBlueprints()[2].model.scale.z
                ]
            };
        }

        const blueModelSystem = tM
            .getRendererObj()
            .getSceneController()
            .getBluemodelSystem();

        if (blueModelSystem.getBlueModel() != undefined) {
            const model = blueModelSystem.getBlueModel();

            this.projectConfig.data.bluemodel = {
                filePath: blueModelSystem.getBlueModelFilePath(),
                opacity: (model!.material as THREE.MeshBasicMaterial).opacity,
                visible: model!.visible,
                pos: [model!.position.x, model!.position.y, model!.position.z],
                rot: [model!.rotation.x, model!.rotation.y, model!.rotation.z],
                scale: [model!.scale.x, model!.scale.y, model!.scale.z]
            };
        }

        const f = configData.find(el => el.name == this.projectConfig.name);

        if (f) {
            f.data = this.projectConfig.data;
        } else {
            const fileName = filePath.split("\\");

            this.projectConfig.name = fileName[fileName.length - 1];
            configData.push(this.projectConfig);
        }

        if (!fs.existsSync(this.folderPath + "/.nodeSnap")) {
            fs.mkdirSync(path.join(this.folderPath, "/.nodeSnap"));
        }

        fs.writeFileSync(
            this.folderPath + "/.nodeSnap/config.json",
            JSON.stringify(configData, null, 1)
        );
    }

    loadConfig(filePath: string) {
        if (filePath == "") {
            useToast().warning(
                "Failed to save project preferences! Invalid path."
            );
            return;
        }
        this.folderPath = filePath;

        const split = this.folderPath.split("\\");
        this.folderPath = this.folderPath
            .replace(split[split.length - 1], "") //remove .truck file and get folder path
            .slice(0, -1); //remove the last \

        this.truckFileName = split[split.length - 1];

        if (!fs.existsSync(this.folderPath + "/.nodeSnap/config.json")) return;

        const parser = fs
            .readFileSync(this.folderPath + "/.nodeSnap/config.json", "utf8")
            .toString();

        const configData: ConfigData[] = JSON.parse(parser);

        const data = configData.find(el => el.name == this.truckFileName);

        if (data == undefined) return;
        this.projectConfig = data;

        /**
         * TODO: find a better way for this
         */
        store.dispatch("setSettings", {
            nodesSpriteScale: this.projectConfig.data.nodeSize,
            gridSize: this.projectConfig.data.gridSize,
            displayNodesName: this.projectConfig.data.displayNodesName
        });

        const tM: TruckEditorManager = TruckEditorManager.getInstance();

        if (this.projectConfig.data.blueprint != undefined) {
            if (this.projectConfig.data.blueprint.filePath == "") return;
            if (!fs.existsSync(this.projectConfig.data.blueprint.filePath)) {
                this.logger.error("blueprint file not found!");
                return;
            }

            tM.getRendererObj()
                .getSceneController()
                .getBlueprintSystem()
                .load(
                    this.projectConfig.data.blueprint.filePath,
                    this.projectConfig.data.blueprint.opacity
                )
                .then(bluePrintsArray => {
                    /**
                     * Position
                     */
                    bluePrintsArray[0].model.position.set(
                        this.projectConfig.data.blueprint!.pos1[0],
                        this.projectConfig.data.blueprint!.pos1[1],
                        this.projectConfig.data.blueprint!.pos1[2]
                    );
                    bluePrintsArray[1].model.position.set(
                        this.projectConfig.data.blueprint!.pos2[0],
                        this.projectConfig.data.blueprint!.pos2[1],
                        this.projectConfig.data.blueprint!.pos2[2]
                    );
                    bluePrintsArray[2].model.position.set(
                        this.projectConfig.data.blueprint!.pos3[0],
                        this.projectConfig.data.blueprint!.pos3[1],
                        this.projectConfig.data.blueprint!.pos3[2]
                    );

                    /**
                     * Rotation
                     */
                    bluePrintsArray[0].model.rotation.set(
                        this.projectConfig.data.blueprint!.rot1[0],
                        this.projectConfig.data.blueprint!.rot1[1],
                        this.projectConfig.data.blueprint!.rot1[2]
                    );
                    bluePrintsArray[1].model.rotation.set(
                        this.projectConfig.data.blueprint!.rot2[0],
                        this.projectConfig.data.blueprint!.rot2[1],
                        this.projectConfig.data.blueprint!.rot2[2]
                    );
                    bluePrintsArray[2].model.rotation.set(
                        this.projectConfig.data.blueprint!.rot3[0],
                        this.projectConfig.data.blueprint!.rot3[1],
                        this.projectConfig.data.blueprint!.rot3[2]
                    );

                    /**
                     * Scale
                     */
                    bluePrintsArray[0].model.scale.set(
                        this.projectConfig.data.blueprint!.scale1[0],
                        this.projectConfig.data.blueprint!.scale1[1],
                        this.projectConfig.data.blueprint!.scale1[2]
                    );
                    bluePrintsArray[1].model.scale.set(
                        this.projectConfig.data.blueprint!.scale2[0],
                        this.projectConfig.data.blueprint!.scale2[1],
                        this.projectConfig.data.blueprint!.scale2[2]
                    );
                    bluePrintsArray[2].model.scale.set(
                        this.projectConfig.data.blueprint!.scale3[0],
                        this.projectConfig.data.blueprint!.scale3[1],
                        this.projectConfig.data.blueprint!.scale3[2]
                    );
                });
        }

        if (this.projectConfig.data.bluemodel != undefined) {
            if (this.projectConfig.data.bluemodel.filePath == "") return;
            if (!fs.existsSync(this.projectConfig.data.bluemodel.filePath)) {
                this.logger.error("blueprint model file not found!");
                return;
            }

            tM.getRendererObj()
                .getSceneController()
                .getBluemodelSystem()
                .load(
                    this.projectConfig.data.bluemodel.filePath,
                    this.projectConfig.data.bluemodel.opacity
                );

            const model = tM
                .getRendererObj()
                .getSceneController()
                .getBluemodelSystem()
                .getBlueModel();

            //If the model loaded successfully
            if (model != undefined) {
                model.position.set(
                    this.projectConfig.data.bluemodel.pos[0],
                    this.projectConfig.data.bluemodel.pos[1],
                    this.projectConfig.data.bluemodel.pos[2]
                );

                model.rotation.set(
                    this.projectConfig.data.bluemodel.rot[0],
                    this.projectConfig.data.bluemodel.rot[1],
                    this.projectConfig.data.bluemodel.rot[2]
                );

                model.scale.set(
                    this.projectConfig.data.bluemodel.scale[0],
                    this.projectConfig.data.bluemodel.scale[1],
                    this.projectConfig.data.bluemodel.scale[2]
                );
            }
        }
    }
}
