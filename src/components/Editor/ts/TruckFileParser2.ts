import * as TruckSectionsInterface from "./TruckFileInterfaces";
import { Section, Keyword } from "./TruckFileParserSections";

import fs from "fs";
import * as Logger from "electron-log";

import store from "@/store/index";
import { TruckFileInfo } from "./TruckFileParser";
//import { TruckFileInfo, TruckFileInterface } from "./TruckFileParser";

export default class TruckFileParser {
    private FileBuffer: string[] | null;
    private truckFile: TruckSectionsInterface.TruckFileInterface;

    private parserLog: Logger.LogFunctions;

    private currArgs: any[];
    private currSection: Section;
    private lastSection: Section;
    private lastKnownSection: Section;
    private currKeyword: Keyword;
    private lastKeyword: Keyword;
    private currLine: string;
    private currLineIndex: number;

    private currPresetBeamId = -1;
    private currPresetBeamScaleId = -1;
    private currPresetNodeId = -1;

    private currGroupId = -1;
    private currCommentId = -1;

    private sectionsKeywordOrder: any[] = [];

    constructor() {
        this.parserLog = Logger.default.scope("Parser");
        this.parserLog.info("init");

        this.FileBuffer = null;
        this.truckFile = {
            title: "New Truck",
            globals: {
                cargoMass: 500,
                dryMass: 3000,
                material: "",
                sbd_preset_id: -1,
                snd_preset_id: -1,
                grp_id: -1,
                comment_id: -1
            },
            nodes: [],
            beams: []
        };

        this.currArgs = [];

        this.currSection = Section.SECTION_TRUCK_NAME;
        this.lastSection = Section.SECTION_TRUCK_NAME;
        this.lastKnownSection = Section.SECTION_TRUCK_NAME;

        this.currKeyword = Keyword.KEYWORD_INVALID;
        this.lastKeyword = Keyword.KEYWORD_INVALID;
        this.currLine = "";
        this.currLineIndex = -1;
    }

    /**
     * Load a truck file
     * @param filePatch path to file to be loaded
     */
    loadFile(filePatch: string) {
        this.parserLog.info("Loading file: " + filePatch);
        this.parserLog.info("Starting section: " + Section[this.currSection]);

        this.FileBuffer = fs
            .readFileSync(filePatch, "utf8")
            .toString()
            .split("\n");

        this.FileBuffer.forEach((value, i) => {
            this.currLine = value;
            this.currLineIndex = i;

            this.parseTruckFileRawLine();
        });

        /**
         * We could do this as soon as we detect keyword "end"
         * But in the latest versions, "end" is not obligatory anymore.
         */
        if (this.unkownData != "") {
            this.FinalizeUnkown();
        }

        this.parserLog.info("File loading done");
        console.log(this.truckFile);
        console.log(this.sectionsKeywordOrder);

        /**
         * Push data to vuex memory
         */
        store.dispatch("setTruckData", this.getTruckFileObject());
        store.dispatch("setParserSettings", {
            sectionsKeywordOrder: this.sectionsKeywordOrder
        });

        return true;
    }

    /**
     * Truck title
     */
    private ParseActorNameLine() {
        this.truckFile.title = this.currLine;
        this.ChangeSection(Section.SECTION_NONE);
    }

    /**
     * Trim the line before reading values etc etc
     */
    private parseTruckFileRawLine() {
        this.currLine = this.currLine.trim();
        this.parseTruckFileLine();
    }

    private beamIndex = 0;
    private firstBeamLine = false;

    private ParseBeams() {
        if (!this.CheckNumArguments(2)) return;

        const beamArray: TruckSectionsInterface.TruckFileBeams = {
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: this.currPresetNodeId,
            grp_id: this.currGroupId,
            comment_id: this.currCommentId,

            id: this.beamIndex,
            node1: this.currArgs[0],
            node2: this.currArgs[1]
        };

        if (this.currArgs[2]) {
            beamArray.options = this.currArgs[2];
        }

        if (this.beamDetacherGroup != -1) {
            beamArray.detacher_group_id = this.beamDetacherGroup;
        }

        this.truckFile.beams!.push(beamArray);
        this.beamIndex++;
    }

    private nodeIndex = 0;
    private ParseNodesUnified() {
        if (!this.CheckNumArguments(4)) return;

        const nodeParams: TruckSectionsInterface.TruckFileNodes = {
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: this.currPresetNodeId,
            grp_id: this.currGroupId,
            comment_id: this.currCommentId,

            idEditor: this.nodeIndex,
            id: this.currArgs[0],
            x: parseFloat(this.currArgs[1]),
            y: parseFloat(this.currArgs[2]),
            z: parseFloat(this.currArgs[3])
        };

        if (this.currArgs[4]) {
            nodeParams.options = this.currArgs[4];

            /**
             * option param
             * for e.g
             * node..., cl 500
             */
            if (this.currArgs[5]) {
                nodeParams.options =
                    nodeParams.options + " " + this.currArgs[5];
            }
        }

        this.truckFile.nodes!.push(nodeParams);
        this.nodeIndex++;
    }

    private ParseAuthors() {
        /**
         * Authors
         */
        /*
        if () {
			//multiple authors so we push
			const currLine = this.lineSplit(line.slice(7).trim());
			const authorArray: TruckSectionsInterface.TruckFileAuthors = {
				type: 
			}
            this.truckFile.info.authors.push(author);
        }*/
    }

    private ParseDirectiveSetBeamDefaults() {
        if (!this.CheckNumArguments(2)) return; // 2 items: keyword, arg

        if (this.truckFile.setBeamDefaults == undefined) {
            this.truckFile.setBeamDefaults = [];
        }

        this.currPresetBeamId++;

        const setBeamDefault: TruckSectionsInterface.TruckFileSetBeamDefaults = {
            preset_id: this.currPresetBeamId,
            springiness: parseInt(this.currArgs[1])
        };

        if (this.currArgs[2]) {
            setBeamDefault.dampingConstant = this.currArgs[2];
            if (this.currArgs[3]) {
                setBeamDefault.deformationThresholdConstant = this.currArgs[3];
                if (this.currArgs[4]) {
                    setBeamDefault.breakingThresholdConstant = this.currArgs[4];
                    if (this.currArgs[5]) {
                        setBeamDefault.beamDiameter = this.currArgs[5];
                        if (this.currArgs[6]) {
                            setBeamDefault.beamMaterial = this.currArgs[6];
                            if (this.currArgs[7]) {
                                setBeamDefault.plasticDeformationCoef = this.currArgs[7];
                            }
                        }
                    }
                }
            }
        }

        this.truckFile.setBeamDefaults.push(setBeamDefault);

        return;
    }

    private ParseDirectiveSetNodeDefaults() {
        if (!this.CheckNumArguments(2)) return; // 2 items: keyword, arg

        if (this.truckFile.setNodesDefaults == undefined) {
            this.truckFile.setNodesDefaults = [];
        }

        this.currPresetNodeId++;

        const setNodesDefaults: TruckSectionsInterface.TruckFileSetNodesDefaults = {
            preset_id: this.currPresetNodeId,
            loadWeight: parseFloat(this.currArgs[1])
        };

        if (this.currArgs[2]) {
            setNodesDefaults.friction = this.currArgs[2];
            if (this.currArgs[3]) {
                setNodesDefaults.volume = this.currArgs[3];
                if (this.currArgs[4]) {
                    setNodesDefaults.surface = this.currArgs[4];
                    if (this.currArgs[5]) {
                        setNodesDefaults.options = this.currArgs[5];
                    }
                }
            }
        }

        this.truckFile.setNodesDefaults.push(setNodesDefaults);

        return;
    }

    private currCommentText = "";

    private ParseComment() {
        if (this.lastKeyword != this.currKeyword) this.currCommentId++;

        this.currCommentText += this.currLine + "\n";

        return;
    }

    private FinalizeComments() {
        if (this.truckFile.comments == undefined) {
            this.truckFile.comments = [];
        }

        const comment: TruckSectionsInterface.TruckFileComment = {
            comment_id: this.currCommentId,
            text: this.currCommentText
        };

        this.truckFile.comments.push(comment);

        this.currCommentText = "";
    }

    private ParseGroup() {
        if (!this.CheckNumArguments(2)) return; // 2 items: ;grp : title, also maybe log a warning here?

        if (this.truckFile.groups == undefined) {
            this.truckFile.groups = [];
        }

        this.currGroupId = this.truckFile.groups.length;

        const groups: TruckSectionsInterface.TruckFileGroup = {
            grp_id: this.truckFile.groups.length,
            title: this.currLine.substr(5)
        };

        this.truckFile.groups.push(groups);
        return;
    }

    private beamDetacherGroup = -1;

    private ParseDirectiveDetacherGroup() {
        if (!this.CheckNumArguments(2)) return; // 2 items: keyword, arg

        if (this.currArgs[1] != "end") {
            this.beamDetacherGroup = this.currArgs[1];
        } else {
            this.beamDetacherGroup = -1;
            return;
        }

        if (this.truckFile.detacher_group == undefined) {
            this.truckFile.detacher_group = [];
        }

        const detacher_group: TruckSectionsInterface.TruckFileDetacherGroup = {
            detacher_id: this.currArgs[1]
        };

        if (
            this.truckFile.detacher_group.filter(
                el => el.detacher_id == this.currArgs[1]
            ).length == 0
        )
            this.truckFile.detacher_group.push(detacher_group);

        return;
    }

    private ParseFileFormatVersion() {
        if (!this.CheckNumArguments(2)) return;

        if (this.truckFile.fileformat == undefined) {
            this.truckFile.fileformat = { version: this.currArgs[1] };
        }

        this.ChangeSection(Section.SECTION_NONE);
    }

    private ParseFileinfo() {
        if (!this.CheckNumArguments(2)) return;

        if (this.truckFile.fileinfo == undefined) {
            this.truckFile.fileinfo = {
                uniqueId: this.currArgs[1]
            };

            if (this.currArgs[2]) {
                this.truckFile.fileinfo.categoryId = parseFloat(
                    this.currArgs[2]
                );

                if (this.currArgs[3]) {
                    this.truckFile.fileinfo.fileVersion = parseFloat(
                        this.currArgs[3]
                    );
                }
            }
        }

        this.ChangeSection(Section.SECTION_NONE);
    }

    private parseGlobals() {
        if (!this.CheckNumArguments(2)) return;

        this.truckFile.globals.dryMass = parseFloat(this.currArgs[0]);
        this.truckFile.globals.cargoMass = parseFloat(this.currArgs[1]);

        if (this.currArgs[2]) {
            this.truckFile.globals.material = this.currArgs[2];
        }

        this.truckFile.globals.comment_id = this.currCommentId;

        this.ChangeSection(Section.SECTION_NONE);
    }

    private parseWheel() {
        if (!this.CheckNumArguments(14)) return;

        const wheel: TruckSectionsInterface.TruckFileWheels = {
            radius: this.currArgs[0],
            width: this.currArgs[1],
            numRays: this.currArgs[2],
            node1: this.currArgs[3],
            node2: this.currArgs[4],
            rigNode: this.currArgs[5],
            braking: this.currArgs[6],
            drive: this.currArgs[7],
            refArmNode: this.currArgs[8],
            mass: this.currArgs[9],
            springness: this.currArgs[10],
            damping: this.currArgs[11],
            face_material_name: this.currArgs[12],
            band_material_name: this.currArgs[13],

            /**
             * SECTION specific
             */
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: this.currPresetNodeId,
            grp_id: this.currGroupId,
            comment_id: this.currCommentId
        };

        if (this.truckFile.wheels == undefined) {
            this.truckFile.wheels = [];
        }

        this.truckFile.wheels.push(wheel);

        return;
    }

    private unkownData = "";

    private ParseUnknown() {
        /**
         * In case we unknownly parse the rest of the file, we don't need to parse the end keyword
         */
        if (this.currLine != "end") this.unkownData += this.currLine + "\n";
    }

    private FinalizeUnkown() {
        if (this.truckFile.unknown == undefined) {
            this.truckFile.unknown = [];
        }

        const unknown: TruckSectionsInterface.TruckFileUnknown = {
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: -1,
            grp_id: -1,
            comment_id: this.currCommentId,

            after_section: Section[this.lastKnownSection],
            data: this.unkownData
        };

        this.truckFile.unknown.push(unknown);

        this.unkownData = "";
    }

    /**
     * parse current line
     * Highly inspired by the RigParser by @only_a_ptr
     */
    private parseTruckFileLine() {
        this.TokenizeCurrentLine();

        this.lastKeyword = this.currKeyword;
        this.currKeyword = this.IdentifyKeywordInCurrentLine();

        switch (this.currKeyword) {
            case Keyword.KEYWORD_INVALID:
                break;

            case Keyword.KEYWORD_FILEFORMATVERSION:
                this.sectionsKeywordOrder.push(this.currKeyword);
                this.ParseFileFormatVersion();
                return;
            case Keyword.KEYWORD_FILEINFO:
                this.sectionsKeywordOrder.push(this.currKeyword);
                this.ParseFileinfo();
                return;

            case Keyword.KEYWORD_BEAMS:
                this.sectionsKeywordOrder.push(this.currKeyword);
                if (!this.firstBeamLine) {
                    /**
                     * for grp indexing
                     */

                    this.currGroupId = -1;
                    console.log("resseting groups index");

                    this.firstBeamLine = true;
                }

                this.ChangeSection(Section.SECTION_BEAMS);
                return;

            case Keyword.KEYWORD_NODES:
                this.sectionsKeywordOrder.push(this.currKeyword);
                this.ChangeSection(Section.SECTION_NODES);
                return;

            case Keyword.KEYWORD_SET_BEAM_DEFAULTS:
                this.ParseDirectiveSetBeamDefaults();
                return;

            case Keyword.KEYWORD_SET_NODE_DEFAULTS:
                this.ParseDirectiveSetNodeDefaults();
                return;

            case Keyword.KEYWORD_GROUP:
                if (this.currSection == Section.SECTION_UNKNOWN) break;
                this.ParseGroup();
                return;

            case Keyword.KEYWORD_COMMENT:
                if (this.currSection == Section.SECTION_UNKNOWN) break;
                this.ParseComment();
                return;

            case Keyword.KEYWORD_DETACHER_GROUP:
                this.ParseDirectiveDetacherGroup();
                return;

            case Keyword.KEYWORD_WHEELS:
                this.sectionsKeywordOrder.push(this.currKeyword);
                this.ChangeSection(Section.SECTION_WHEELS);
                return;

            case Keyword.KEYWORD_GLOBALS:
                this.sectionsKeywordOrder.push(this.currKeyword);
                this.ChangeSection(Section.SECTION_GLOBALS);
                return;
        }

        switch (this.currSection) {
            case Section.SECTION_TRUCK_NAME:
                this.ParseActorNameLine();
                return;

            case Section.SECTION_BEAMS:
                this.ParseBeams();
                return;

            case Section.SECTION_NODES:
            case Section.SECTION_NODES_2:
                this.ParseNodesUnified();
                return;

            case Section.SECTION_WHEELS:
                this.parseWheel();
                break;

            case Section.SECTION_GLOBALS:
                this.parseGlobals();
                break;

            case Section.SECTION_UNKNOWN:
                this.ParseUnknown();
                return;
        }
    }

    /**
     * splits line with space or commas etc etc
     * @param line line string to split
     * Quote from @only_a_ptr file format definition: (source/main/resources/rig_def_fileformat/ReadMe.txt)
     * 'Possible separators: space, tabulator, comma ",", colon ":" or pipe "|".'
     */
    private lineSplit(line: string): string[] {
        return line.split(/[\s,|:\t]+/);
    }

    /**
     * Checks if current line has a section keyword
     * Inspired from RigDef_Parser.cpp | author: @only_a_ptr
     */
    private IdentifyKeywordInCurrentLine(): Keyword {
        if (this.currLineIndex == 0) return Keyword.KEYWORD_INVALID;

        // Quick check - keyword always starts with ASCII letter
        const c = this.currLine.charAt(0).toLowerCase();

        /**
         * Editor specific
         */
        if (c == ";") {
            if (this.currLine.substr(0, 5) == ";grp:") {
                return Keyword.KEYWORD_GROUP;
            } else {
                return Keyword.KEYWORD_COMMENT;
            }
        } else if (
            this.lastKeyword == Keyword.KEYWORD_COMMENT &&
            this.currSection != Section.SECTION_UNKNOWN //this should be ditched after all sections are parsed by rorEditor
        ) {
            this.FinalizeComments();
        }

        if (c > "z" || c < "a") {
            return Keyword.KEYWORD_INVALID;
        }

        this.parserLog.info(
            "Found keyword: KEYWORD_" +
                this.lineSplit(this.currLine.toUpperCase())[0]
        );

        /**
         * Replaces regex search function
         * Needs more testing
         */
        const searchKeyword: any =
            Keyword[
                ("KEYWORD_" +
                    this.lineSplit(this.currLine.toUpperCase())[0]) as any
            ];

        if (searchKeyword != undefined) {
            if (this.currSection == Section.SECTION_UNKNOWN) {
                this.FinalizeUnkown();
            }
            return searchKeyword;
        } else {
            this.parserLog.warn("Keyword not supported, parsing as unknown...");
            this.ChangeSection(Section.SECTION_UNKNOWN, true);

            return Keyword.KEYWORD_INVALID;
        }
    }

    private TokenizeCurrentLine() {
        if (this.currLine.length == 0) {
            this.currArgs = [];
            return;
        }

        this.currArgs = this.lineSplit(this.currLine);
    }

    /**
     *
     * @param newSection new section to switch to
     */
    private ChangeSection(newSection: Section, bl = false) {
        if (!bl)
            this.parserLog.info("Changing section to: " + Section[newSection]);

        if (this.currSection != Section.SECTION_UNKNOWN) {
            if (this.currSection != Section.SECTION_NONE)
                this.lastKnownSection = this.currSection;
        }

        this.lastSection = this.currSection;

        this.currSection = newSection;
    }

    private CheckNumArguments(numRequireArgs: number): boolean {
        if (numRequireArgs > this.currArgs.length) {
            return false;
        }
        return true;
    }

    /**
     * dump data from memory to file
     * @param path path where the file will be saved
     * TODO: backups
     */
    public saveFile(path: string) {
        this.parserLog.info("Requesting file save to: " + path);

        this.truckFile = store.getters.getTruckData;

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
        this.parserLog.info("Making a backup: " + path + ".bak");

        if (fs.existsSync(path)) {
            fs.copyFileSync(path, path + ".bak");
        }

        fs.writeFileSync(path, fileStr);

        this.parserLog.info("Done saving file.");
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
                    this.getNodeRealId(currWheel.node1) +
                    ", " +
                    this.getNodeRealId(currWheel.node2) +
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

                fileStr += el.id + ", " + el.x + ", " + el.y + ", " + el.z;

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

                fileStr +=
                    this.getNodeRealId(el.node1) +
                    ", " +
                    this.getNodeRealId(el.node2);

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

        if (el.grp_id != -1) {
            if (this.currGroupId != el.grp_id) {
                this.currGroupId = el.grp_id;
                fileStr +=
                    "\n" +
                    ";grp:" +
                    this.truckFile.groups?.filter(
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

        if (el.comment_id != -1) {
            if (this.currCommentId != el.comment_id) {
                this.currCommentId = el.comment_id;
                fileStr +=
                    "\n" +
                    this.truckFile.comments?.filter(
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
        el: TruckSectionsInterface.TruckFileBeams
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

        if (el.sbd_preset_id != -1) {
            if (this.currPresetBeamId != el.sbd_preset_id) {
                this.currPresetBeamId = el.sbd_preset_id;

                const sbd = this.truckFile.setBeamDefaults?.filter(
                    el => el.preset_id == this.currPresetBeamId
                )[0];

                fileStr += "\n" + "set_beam_defaults " + sbd?.springiness;

                if (sbd?.dampingConstant) {
                    fileStr += ", " + sbd?.dampingConstant;
                    if (sbd?.deformationThresholdConstant) {
                        fileStr += ", " + sbd?.deformationThresholdConstant;
                        if (sbd?.breakingThresholdConstant) {
                            fileStr += ", " + sbd?.breakingThresholdConstant;
                            if (sbd?.beamDiameter) {
                                fileStr += ", " + sbd?.beamDiameter;
                                if (sbd?.beamMaterial) {
                                    fileStr += ", " + sbd?.beamMaterial;
                                    if (sbd?.plasticDeformationCoef) {
                                        fileStr +=
                                            ", " + sbd?.plasticDeformationCoef;
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

        if (el.snd_preset_id != -1) {
            if (this.currPresetNodeId != el.snd_preset_id) {
                this.currPresetNodeId = el.snd_preset_id;

                const snd = this.truckFile.setNodesDefaults?.filter(
                    el => el.preset_id == this.currPresetNodeId
                )[0];

                fileStr += "\n" + "set_node_defaults " + snd?.loadWeight;

                if (snd?.friction) {
                    fileStr += ", " + snd?.friction;
                    if (snd?.volume) {
                        fileStr += ", " + snd?.volume;
                        if (snd?.surface) {
                            fileStr += ", " + snd?.surface;
                            if (snd?.options) {
                                fileStr += ", " + snd?.options;
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

    public getTruckFileObject() {
        return this.truckFile;
    }

    /**
     * converts node editor id into real node name for the game
     * @param str node_name
     */
    private getNodeRealId(str: string): string {
        //console.log(str);
        return this.truckFile.nodes?.filter(
            currNode => currNode.idEditor == parseInt(str)
        )[0].id!;
    }
}
