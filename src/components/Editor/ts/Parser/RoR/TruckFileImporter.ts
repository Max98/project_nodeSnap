import * as TruckSectionsInterface from "../../TruckFileInterfaces";
import { Section, Keyword } from "./TruckFileParserSections";

import fs from "fs";
import * as Logger from "electron-log";

import store from "@/store/index";

/**
 * Note:
 * RoR has inversed axis
 *
 * RoR =>    Z X Y
 * editor => X Y Z
 */

export default class TruckFileImporter {
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
        this.parserLog = Logger.default.scope("TruckFileImporter");
        this.parserLog.info("init");

        this.FileBuffer = null;

        /**
         * TODO: Get from TruckEditor.ts
         */
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
            beams: [],
            groups: []
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
     * @returns truckTitle
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

        store.dispatch("setParserSettings", {
            sectionsKeywordOrder: this.sectionsKeywordOrder
        });

        /**
         * Push data to vuex memory
         */
        //store.dispatch("setTruckData", this.truckFile);

        return this.truckFile;
    }

    /**
     * Truck title
     */
    private ParseActorNameLine() {
        if (!this.currLine.startsWith(";")) {
            this.truckFile.title = this.currLine;
            this.ChangeSection(Section.SECTION_NONE);
        }
    }

    /**
     * Trim the line before reading values etc etc
     */
    private parseTruckFileRawLine() {
        this.currLine = this.currLine.trim();
        //if (this.currLine.length == 0) return;

        this.parseTruckFileLine();
    }

    private beamIndex = 0;
    private firstBeamLine = false;

    private ParseBeams() {
        if (!this.CheckNumArguments(2)) return;

        const beamArray: TruckSectionsInterface.EditorBeam = {
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: this.currPresetNodeId,
            grp_id: this.currGroupId,
            comment_id: this.currCommentId,

            id: this.beamIndex,
            node1: this.getNodeIdFromName(this.currArgs[0]),
            node2: this.getNodeIdFromName(this.currArgs[1]),

            isVisible: true
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

        const nodeParams: TruckSectionsInterface.EditorNode = {
            sbd_preset_id: this.currPresetBeamId,
            snd_preset_id: this.currPresetNodeId,
            grp_id: this.currGroupId,
            comment_id: this.currCommentId,

            id: this.nodeIndex,
            name: this.currArgs[0],

            /**
             * TODO: support nodes2
             */
            type: TruckSectionsInterface.nodeType.DEFAULT,

            x: parseFloat(this.currArgs[3]), //y
            y: parseFloat(this.currArgs[1]), //z
            z: parseFloat(this.currArgs[2]), //x

            isVisible: true
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

        let grpType = "none";

        if (this.currSection == Section.SECTION_NODES) {
            grpType = "node";
        } else if (this.currSection == Section.SECTION_BEAMS) {
            grpType = "beam";
        }

        const groups: TruckSectionsInterface.EditorGroup = {
            grp_id: this.truckFile.groups.length,
            title: this.currLine.substr(5),
            type: grpType,
            isVisible: true
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
        if (this.currSection == Section.SECTION_TRUCK_NAME)
            return Keyword.KEYWORD_INVALID;

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
     * Utils
     */
    private getNodeIdFromName(str: string): number {
        return this.truckFile.nodes.filter(el => el.name == str)[0].id;
    }
}
