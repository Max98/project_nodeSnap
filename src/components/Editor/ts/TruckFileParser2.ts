import * as TruckSectionsInterface from "./TruckFileInterfaces";
import { Section, Keyword } from "./TruckFileParserSections";

import fs from "fs";
import * as Logger from "electron-log";

export default class TruckFileParser {
    private FileBuffer: string[] | null;
    private truckFile: TruckSectionsInterface.TruckFileInterface;

    private parserLog: Logger.LogFunctions;

    private currArgs: any[];
    private currSection: Section;
    private currKeyword: Keyword;
    private currLine: string;
    private currLineIndex: number;

    private currPresetBeamId = -1;
    private currPresetBeamScaleId = -1;
    private currPresetNodeId = -1;

    private currGroupId = -1;
    private currCommentId = -1;

    constructor() {
        this.parserLog = Logger.default.scope("Parser");
        this.parserLog.info("init");

        this.FileBuffer = null;
        this.truckFile = {
            info: { title: "New Truck", authors: [] },
            globals: {
                cargoMass: 500,
                dryMass: 3000,
                material: ""
            },
            nodes: [],
            beams: []
        };

        this.currArgs = [];
        this.currSection = Section.SECTION_TRUCK_NAME;
        this.currKeyword = Keyword.KEYWORD_INVALID;
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

        this.parserLog.info("File loading done");
        console.log(this.truckFile);

        return true;
    }

    /**
     * Truck title
     */
    private ParseActorNameLine() {
        this.truckFile.info.title = this.currLine;
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
        console.log(this.currArgs);

        const setBeamDefault: TruckSectionsInterface.TruckFileSetBeamDefaults = {
            preset_id: this.currPresetBeamId,
            springiness: parseInt(this.currArgs[1])
        };

        if (this.currArgs[2]) {
            setBeamDefault.dampingConstant = this.currArgs[2];
        }

        if (this.currArgs[3]) {
            setBeamDefault.deformationThresholdConstant = this.currArgs[3];
        }

        if (this.currArgs[4]) {
            setBeamDefault.breakingThresholdConstant = this.currArgs[4];
        }

        if (this.currArgs[5]) {
            setBeamDefault.beamDiameter = this.currArgs[5];
        }

        if (this.currArgs[6]) {
            setBeamDefault.beamMaterial = this.currArgs[6];
        }

        if (this.currArgs[7]) {
            setBeamDefault.plasticDeformationCoef = this.currArgs[7];
        }

        this.truckFile.setBeamDefaults.push(setBeamDefault);

        return;
    }

    private ParseComment() {
        this.currCommentId++;
        return;
    }

    private ParseGroup() {
        this.currGroupId++;
        return;
    }

    private beamDetacherGroup = -1;

    private ParseDirectiveDetacherGroup() {
        this.beamDetacherGroup++;
    }

    /**
     * parse current line
     */
    private parseTruckFileLine() {
        this.TokenizeCurrentLine();
        const keyword = this.IdentifyKeywordInCurrentLine();

        switch (keyword) {
            case Keyword.KEYWORD_INVALID:
                break;

            case Keyword.KEYWORD_BEAMS:
                this.ChangeSection(Section.SECTION_BEAMS);
                return;

            case Keyword.KEYWORD_NODES:
                this.ChangeSection(Section.SECTION_NODES);
                return;

            case Keyword.KEYWORD_SET_BEAM_DEFAULTS:
                this.ParseDirectiveSetBeamDefaults();
                return;

            case Keyword.KEYWORD_GROUP:
                this.ParseGroup();
                return;

            case Keyword.KEYWORD_COMMENT:
                this.ParseComment();
                return;

            case Keyword.KEYWORD_DETACHER_GROUP:
                this.ParseDirectiveDetacherGroup();
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
        }

        /**
         *
         */
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
            return searchKeyword;
        }

        //Reset section to none once we find a new section
        //So even if the editor does not know about the section, it won't keep parsing data as
        //it thought it was the last one
        //second param is just to not log section none state
        this.ChangeSection(Section.SECTION_NONE, true);

        this.parserLog.warn("Keyword not supported, ignoring...");

        return Keyword.KEYWORD_INVALID;
    }

    private TokenizeCurrentLine() {
        this.currArgs = this.lineSplit(this.currLine);
    }

    /**
     *
     * @param newSection new section to switch to
     */
    private ChangeSection(newSection: Section, bl = false) {
        if (!bl)
            this.parserLog.info("Changing section to: " + Section[newSection]);

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
    public saveFile(path: string /*data: TruckFileInterface*/) {
        console.log();
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
