import * as TruckSectionsInterface from "../../TruckFileInterfaces";
import { Keyword } from "./TruckFileParserSections";

import fs from "fs";
import path from "path";
import * as Logger from "electron-log";

import store from "@/store/index";
import TruckEditorManager from "../../TruckEditorManagaer";

const remote = require("electron").remote;
const { Menu, MenuItem, dialog } = remote;

/**
 * Note:
 * RoR has inversed axis
 *
 * RoR =>    Z X Y
 * editor => X Y Z
 */

export default class TruckFileExporter {
    private truckFile: TruckSectionsInterface.TruckFileInterface;

    private parserLog: Logger.LogFunctions;

    private currPresetBeamId = -1;
    private currPresetBeamScaleId = -1;
    private currPresetNodeId = -1;

    private currGroupId = -1;
    private currCommentId = -1;

    private sectionsKeywordOrder: any[] = [];

    private beamDetacherGroup = -1;

    constructor() {
        this.parserLog = Logger.default.scope("TruckFileExporter");
        this.parserLog.info("init");

        this.truckFile = TruckEditorManager.getInstance()
            .getEditorObj()
            .getData();
    }

    /**
     * dump data from memory to file
     * @param path path where the file will be saved
     * TODO: backups
     */
    public saveFile(): string {
        let filePath: string | undefined = store.getters.getTruckFilePath;

        if (filePath == "") {
            filePath = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
                defaultPath: "newTruck",
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
            });
            store.dispatch("setTruckFilePath", filePath);
        }

        if (filePath == undefined) {
            this.parserLog.info("File path not found! " + filePath);
            return "";
        }

        this.parserLog.info("Requesting file save to: " + filePath);

        this.sectionsKeywordOrder =
            store.getters.getParserSettings.sectionsKeywordOrder;

        if (this.sectionsKeywordOrder.length == 0) {
            this.sectionsKeywordOrder.push(Keyword.KEYWORD_GLOBALS);
            this.sectionsKeywordOrder.push(Keyword.KEYWORD_FILEINFO);
            this.sectionsKeywordOrder.push(Keyword.KEYWORD_NODES);
            this.sectionsKeywordOrder.push(Keyword.KEYWORD_BEAMS);
        }

        let fileStr = "";

        fileStr += this.truckFile.title;

        fileStr += "\n" + "\n"; //extra line breaks

        let lastUnkownIndex = 0;

        /**
         * post truck name unknown sections
         */
        if (this.truckFile.unknown) {
            for (
                ;
                lastUnkownIndex < this.truckFile.unknown.length;
                lastUnkownIndex++
            ) {
                const element = this.truckFile.unknown[lastUnkownIndex];
                const afterKeyword: string = element.after_section;

                console.log("lol: ", afterKeyword.substr(8));

                if (afterKeyword.substr(8) == "TRUCK_NAME") {
                    fileStr += this.onSaveProcessComments(element);
                    fileStr += this.onSaveProcessSetBeamDefaults(element);
                    fileStr += element.data;
                } else {
                    break;
                }
            }
        }

        /**
         * Restore sections in the order they were parsed
         */
        for (let i = 0; i < this.sectionsKeywordOrder.length; i++) {
            const keywordSection: Keyword = this.sectionsKeywordOrder[i]; //Keyword[this.sectionsKeywordOrder[i]];
            fileStr += "\n";

            switch (keywordSection) {
                case Keyword.KEYWORD_NODES:
                    fileStr += this.onSaveProcessNodes();
                    break;

                case Keyword.KEYWORD_BEAMS:
                    fileStr += this.onSaveProcessBeams();
                    break;

                case Keyword.KEYWORD_WHEELS:
                    fileStr += this.onSaveProcessWheels();
                    break;

                case Keyword.KEYWORD_GLOBALS:
                    fileStr += this.onSaveProcessGlobals();
                    break;

                /**
                 * FIX: this does not get back into the order it is supposed to be
                 */
                case Keyword.KEYWORD_FILEINFO:
                    fileStr += this.onSaveProcessFileinfo();
                    break;

                default:
                    break;
            }

            if (this.truckFile.unknown) {
                fileStr += "\n"; //extra line breaks
                for (
                    ;
                    lastUnkownIndex < this.truckFile.unknown.length;
                    lastUnkownIndex++
                ) {
                    const element = this.truckFile.unknown[lastUnkownIndex];
                    const afterKeyword: string = element.after_section;

                    if (
                        afterKeyword.substr(8) ==
                        Keyword[keywordSection].substr(8)
                    ) {
                        fileStr += this.onSaveProcessComments(element);
                        fileStr += this.onSaveProcessSetBeamDefaults(element);
                        fileStr += element.data;
                    } else {
                        break;
                    }
                }
                fileStr += "\n"; //extra line breaks
            }
        }

        fileStr += "end";

        /**
         * TODO: backup system with more than just one backup
         */

        if (fs.existsSync(filePath)) {
            this.parserLog.info(
                "Making a backup: " + filePath + Date.now() + ".bak"
            );

            const split = filePath.split("\\");
            const folderPath = filePath
                .replace(split[split.length - 1], "")
                .slice(0, -1);

            if (!fs.existsSync(folderPath + "/.nodeSnap")) {
                fs.mkdirSync(path.join(folderPath, ".nodeSnap"));
            }

            fs.copyFileSync(
                filePath,
                folderPath +
                    "/.nodeSnap/" +
                    split[split.length - 1] +
                    "." +
                    Date.now() +
                    ".bak"
            );
        }

        fs.writeFileSync(filePath, fileStr);

        this.parserLog.info("Done saving file.");
        return filePath;
    }

    private onSaveProcessWheels() {
        let fileStr = "";

        if (this.truckFile.wheels) {
            fileStr += "wheels" + "\n";
            for (let i = 0; i < this.truckFile.wheels.length; i++) {
                const currWheel = this.truckFile.wheels[i];

                fileStr += this.onSaveProcessComments(currWheel);
                fileStr +=
                    currWheel.radius +
                    ", " +
                    currWheel.width +
                    ", " +
                    currWheel.numRays +
                    ", " +
                    currWheel.node1 +
                    ", " +
                    currWheel.node2 +
                    ", " +
                    currWheel.rigNode +
                    ", " +
                    currWheel.braking +
                    ", " +
                    currWheel.drive +
                    ", " +
                    currWheel.refArmNode +
                    ", " +
                    currWheel.mass +
                    ", " +
                    currWheel.springness +
                    ", " +
                    currWheel.damping +
                    ", " +
                    currWheel.face_material_name +
                    ", " +
                    currWheel.band_material_name +
                    "\n";
            }
        }
        return fileStr;
    }

    private onSaveProcessNodes() {
        /**
         * nodes
         * order ->
         * 1 group
         * 2 set_nodes_default
         * 3 Set_default_minimass
         * 4 comments
         */
        let fileStr = "";
        if (this.truckFile.nodes.length != 0) {
            fileStr += "nodes" + "\n";

            for (let i = 0; i < this.truckFile.nodes.length; i++) {
                const el = this.truckFile.nodes[i];

                fileStr += this.onSaveProcessGroups(el);

                fileStr += this.onSaveProcessSetNodeDefaults(el);

                fileStr += this.onSaveProcessComments(el);

                //Inverted axis, see note at file top
                fileStr += el.id + ", " + el.y + ", " + el.z + ", " + el.x;

                if (el.options) {
                    fileStr += ", " + el.options;
                }

                fileStr += "\n";
            }
        } else {
            this.parserLog.error("No nodes found, truck file invalid!");
        }

        return fileStr;
    }

    private onSaveProcessBeams() {
        /**
         * Beams
         *
         * order ->
         * 1 group
         * 2 set_beam_default
         * 3 detacher_group
         * 4 comments
         */
        let fileStr = "";

        if (this.truckFile.beams.length != 0) {
            fileStr += "beams" + "\n";

            for (let i = 0; i < this.truckFile.beams.length; i++) {
                const el = this.truckFile.beams[i];

                fileStr += this.onSaveProcessGroups(el);
                fileStr += this.onSaveProcessSetBeamDefaults(el);
                fileStr += this.onSaveProcessDetacherGroups(el);
                fileStr += this.onSaveProcessComments(el);

                fileStr += el.node1 + ", " + el.node2;

                if (el.options) {
                    fileStr += ", " + el.options;
                }

                fileStr += "\n";
            }
        } else {
            this.parserLog.error("No beams found, truck file invalid!");
        }
        return fileStr;
    }

    private onSaveProcessGroups(el: TruckSectionsInterface.SECTION): string {
        let fileStr = "";

        if (!this.truckFile.groups) return "";

        if (el.grp_id != -1) {
            if (this.currGroupId != el.grp_id) {
                this.currGroupId = el.grp_id;
                fileStr +=
                    "\n" +
                    ";grp:" +
                    this.truckFile.groups.filter(
                        el => el.grp_id == this.currGroupId
                    )[0].title +
                    "\n";
            }
        } else {
            this.currGroupId = -1;
        }

        return fileStr;
    }

    private onSaveProcessComments(el: TruckSectionsInterface.SECTION): string {
        let fileStr = "";

        if (!this.truckFile.comments) return "";

        if (el.comment_id != -1) {
            if (this.currCommentId != el.comment_id) {
                this.currCommentId = el.comment_id;
                fileStr +=
                    "\n" +
                    this.truckFile.comments.filter(
                        el => el.comment_id == this.currCommentId
                    )[0].text +
                    "\n";
            }
        } else {
            this.currCommentId = -1;
        }

        return fileStr;
    }

    /**
     * This section is specific to beams
     * @param el
     * @param lineBreak
     */
    private onSaveProcessDetacherGroups(
        el: TruckSectionsInterface.EditorBeam
    ): string {
        let fileStr = "";

        if (el.detacher_group_id && el.detacher_group_id != -1) {
            if (this.beamDetacherGroup != el.detacher_group_id) {
                this.beamDetacherGroup = el.detacher_group_id;
                fileStr += "detacher_group " + el.detacher_group_id + "\n";
            }
        } else {
            this.beamDetacherGroup = -1;
        }

        return fileStr;
    }

    private onSaveProcessSetBeamDefaults(
        el: TruckSectionsInterface.SECTION
    ): string {
        let fileStr = "";

        if (!this.truckFile.setBeamDefaults) return "";

        if (el.sbd_preset_id != -1) {
            if (this.currPresetBeamId != el.sbd_preset_id) {
                this.currPresetBeamId = el.sbd_preset_id;

                const sbd = this.truckFile.setBeamDefaults.filter(
                    el => el.preset_id == this.currPresetBeamId
                )[0];

                fileStr += "\n" + "set_beam_defaults " + sbd.springiness;

                if (sbd.dampingConstant) {
                    fileStr += ", " + sbd.dampingConstant;
                    if (sbd.deformationThresholdConstant) {
                        fileStr += ", " + sbd.deformationThresholdConstant;
                        if (sbd.breakingThresholdConstant) {
                            fileStr += ", " + sbd.breakingThresholdConstant;
                            if (sbd.beamDiameter) {
                                fileStr += ", " + sbd.beamDiameter;
                                if (sbd.beamMaterial) {
                                    fileStr += ", " + sbd.beamMaterial;
                                    if (sbd.plasticDeformationCoef) {
                                        fileStr +=
                                            ", " + sbd.plasticDeformationCoef;
                                    }
                                }
                            }
                        }
                    }
                }

                fileStr += "\n";
            }
        }
        return fileStr;
    }

    private onSaveProcessSetNodeDefaults(
        el: TruckSectionsInterface.SECTION
    ): string {
        let fileStr = "";

        if (!this.truckFile.setNodesDefaults) return "";

        if (el.snd_preset_id != -1) {
            if (this.currPresetNodeId != el.snd_preset_id) {
                this.currPresetNodeId = el.snd_preset_id;

                const snd = this.truckFile.setNodesDefaults.filter(
                    el => el.preset_id == this.currPresetNodeId
                )[0];

                fileStr += "\n" + "set_node_defaults " + snd.loadWeight;

                if (snd.friction) {
                    fileStr += ", " + snd.friction;
                    if (snd.volume) {
                        fileStr += ", " + snd.volume;
                        if (snd.surface) {
                            fileStr += ", " + snd.surface;
                            if (snd.options) {
                                fileStr += ", " + snd.options;
                            }
                        }
                    }
                }

                fileStr += "\n";
            }
        }
        return fileStr;
    }

    private onSaveProcessGlobals() {
        let fileStr = "";

        if (this.truckFile.globals) {
            fileStr += "globals" + "\n";
            fileStr += this.onSaveProcessComments(this.truckFile.globals);
            fileStr +=
                this.truckFile.globals.dryMass +
                "," +
                this.truckFile.globals.cargoMass +
                "," +
                this.truckFile.globals.material +
                "\n";
        }

        return fileStr;
    }

    private onSaveProcessFileinfo() {
        let fileStr = "";

        if (this.truckFile.fileinfo) {
            const fileInfo: TruckSectionsInterface.TruckFileInfo = this
                .truckFile.fileinfo;

            fileStr = "fileinfo " + fileInfo.uniqueId;

            if (fileInfo.categoryId) {
                fileStr += ", " + fileInfo.categoryId;

                if (fileInfo.fileVersion) {
                    fileStr += ", " + fileInfo.fileVersion;
                }
            }
        }

        return fileStr;
    }
}
