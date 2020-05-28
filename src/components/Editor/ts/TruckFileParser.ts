import readline from "readline";
import fs from "fs";
import { parse } from "path";
import store from "@/store/index";

/**
 * Truck file header
 */
export interface TruckFileInfo {
    title: string;
    authors: string[];
}

/**
 * Globals
 */
export interface TruckFileGlobals {
    dryMass: number;
    cargoMass: number;
    material: string;
}

/**
 * set_nodes_defaults
 */

export interface TruckFileSetNodesDefaults {
    after?: string;
    before?: string;

    loadWeight?: number;
    friction?: number;
    volume?: number;
    surface?: number;
    options?: string;
}

/**
 * set_beam_defaults
 */

export interface TruckFileSetBeamDefaults {
    after?: string;
    before?: string;

    springiness?: number;
    dampingConstant?: number;
    deformationThresholdConstant?: number;
    breakingThresholdConstant?: number;
    beamDiameter?: number;
    beamMaterial?: string;
    plasticDeformationCoef?: number;
}

/**
 * Wheels2
 * rorEditor will use this as default wheels instead of wheels
 */

export interface TruckFileWheels2 {
    rimRadius: number;
    tyreRadius: number;
    width: number;
    numRays: number;
    node1: string;
    node2: string;
    rigNode: string;
    braking: number;
    drive: number;
    refArmNode: string;
    mass: number;
    rimSpringness: number;
    rimDamping: number;
    tyreSpringness: number;
    tyreDamping: number;
    material: string;
}

/**
 * Wings
 */

export interface TruckFileWings {
    /**
     * Nodes
     */
    nodeA: string;
    nodeB: string;
    nodeC: string;
    nodeD: string;
    nodeE: string;
    nodeF: string;
    nodeG: string;
    nodeH: string;

    /**
     * texture coordinates
     */
    frontLeftX: number;
    frontLeftY: number;
    frontRightX: number;
    frontRightY: number;
    backLeftX: number;
    backLeftY: number;
    backRightX: number;
    backRightY: number;

    /**
     * Wing specific stuff
     */
    controlType: string;
    chordControlStart: number;
    minDeflection: number;
    maxDeflection: number;
    airfoil: string;
    coeff: number;
}

/**
 * Fusedrag
 */

export interface TruckFileFuseDrag {
    frontNode: string;
    backNode: string;
    fuselageWidth: number;
}

/**
 * Pistonprop
 */

export interface TruckFilePistonProp {
    refNode: string;
    axisNode: string;
    nodeBlade1: string;
    nodeBlade2: string;
    nodeBlade3: string;
    nodeBlade4: string;
    coupleNode: string;
    enginePower: number;
    pitch: number;
    airfoil: string;
}

/**
 * Truboprop
 */

export interface TruckFileTurboProp {
    refNode: string;
    axisNode: string;
    nodeBlade1: string;
    nodeBlade2: string;
    nodeBlade3: string;
    nodeBlade4: string;
    turbinePower: number;
    airfoil: string;
}

/**
 * Trubojets
 */

export interface TruckFileTurboJets {
    frontNode: string;
    backNode: string;
    sideNode: string;
    isReversable: boolean;
    dryThrust: number;
    wetThrust: number;
    frontDiameter: number;
    backDiameter: number;
    nozzleLenght: number;
}

/**
 * cameras
 */

export interface TruckFileCameras {
    centerNode: string;
    backNode: string;
    leftNode: string;
}

/**
 * Cinecam
 */

export interface TruckFileCineCam {
    x: number;
    y: number;
    z: number;
    node1: string;
    node2: string;
    node3: string;
    node4: string;
    node5: string;
    node6: string;
    node7: string;
    node8: string;
    spring?: number;
    damping?: number;
    nodeWeight?: number;
}

/**
 * Nodes
 */

export interface TruckFileNodes {
    id: string; //we parse as string to support nodes2
    idEditor?: number;
    x: number;
    y: number;
    z: number;
    options?: string;
}

/**
 * Beams
 */
export interface TruckFileBeams {
    node1: string | number;
    node2: string | number;
    options?: string;
    /**
     * We use id here to keep stuff in order
     * Very important for set_beam_defaults
     */
    id: number;
}

/**
 * The whole truck file interface
 */
export interface TruckFileInterface {
    info: TruckFileInfo;
    globals: TruckFileGlobals;
    nodes?: TruckFileNodes[];
    beams?: TruckFileBeams[];
    setNodesDefaults?: TruckFileSetNodesDefaults[];
    setBeamDefaults?: TruckFileSetBeamDefaults[];
    cameras?: TruckFileCameras;
    cineCam?: TruckFileCineCam;

    fusedrag?: TruckFileFuseDrag;
    turboJet?: TruckFileTurboJets[];
    turboProp?: TruckFileTurboProp[];
    pistonProp?: TruckFilePistonProp[];
    wings?: TruckFileWings[];
    wheels2?: TruckFileWheels2[];
}

export default class TruckFileLoad {
    private truckFile: TruckFileInterface = {
        info: { title: "New Truck", authors: [] },
        globals: { cargoMass: 500, dryMass: 3000, material: "" }
    };

    private parserConfig = {
        /**
         * Parser specific
         */
        isNextEmptyLine: false,
        canParse: false,
        lastLine: "",

        /**
         * Defines
         */
        globals: false,
        nodes: false,
        beams: false,
        cameras: false,
        cineCam: false,
        wheels2: false,

        /**
         * Planes specific
         */
        fusedrag: false,
        turboJet: false,
        turboProp: false,
        pistonProp: false,
        wings: false
    };

    private beamsIndex = 0;

    getTruckFileObject() {
        return this.truckFile;
    }

    loadFile(filePatch: string) {
        const array = fs
            .readFileSync(filePatch, "utf8")
            .toString()
            .split("\n");

        array.forEach((value, i) => {
            this.parseTruckFile(value, i, array);
        });

        if (this.truckFile.nodes) {
            for (let index = 0; index < this.truckFile.nodes.length; index++) {
                const element = this.truckFile.nodes![index];
                element.idEditor = index;
            }
        }

        console.log(this.truckFile);

        return true;
    }

    private parseTruckFile(line: string, i: number, array: any) {
        if (line.length == 1) return; //spaces
        if (line.length == 0) return; //spaces
        if (line.startsWith(";")) return; //Maybe handle comments in the future

        /**
         * Title
         */
        if (i == 0) {
            //console.log("title", line);
            this.truckFile.info.title = line.trim();
        }

        /**
         * Authos
         */

        if (line.startsWith("author")) {
            //multiple authors so we push
            const author: string = line.split(" ")[3].trim();
            this.truckFile.info.authors.push(author);
        }

        /**
         * Globals
         */
        if (this.parserConfig.globals) {
            const globals = line.split(",");

            this.truckFile.globals.dryMass = parseFloat(globals[0]);
            this.truckFile.globals.cargoMass = parseFloat(globals[1]);
            this.truckFile.globals.material = globals[2].trim();

            this.parserConfig.globals = false;
        }

        if (line.startsWith("globals")) {
            this.parserConfig.globals = true;
        }

        /**
         * Nodes
         */

        if (this.parserConfig.nodes) {
            //console.log(line);
            //console.log(line.length);
            this.parserConfig.canParse = true;
            if (line.split(",").length == 1) {
                //TODO add support for nodes2
                //if line doesn't start with a number

                //that's it, we are done here
                this.parserConfig.nodes = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        if (line.startsWith("set_node_defaults")) {
                            if (this.truckFile.setNodesDefaults == undefined) {
                                this.truckFile.setNodesDefaults = [];
                            }
                            //const node = line.split(" ");

                            const node = line
                                .replace("set_node_defaults", "")
                                .split(",");

                            //we check for comments and we jump them lol
                            //TODO this is not enough
                            let lineIndex = 0;
                            do {
                                lineIndex++;
                            } while (
                                array[i + lineIndex].startsWith(";") ||
                                array[i + lineIndex].length == 1
                            );

                            this.truckFile.setNodesDefaults!.push({
                                after: this.parserConfig.lastLine,
                                before: array[i + lineIndex], //next line lol before we get there
                                loadWeight: parseFloat(node[0]),
                                friction: parseFloat(node[1]),
                                volume: parseFloat(node[2]),
                                surface: parseFloat(node[3])
                                //options: node[4].trim() //TODO fix this
                            });
                        } else {
                            const node = line.split(",");
                            if (this.truckFile.nodes == undefined) {
                                this.truckFile.nodes = [];
                            }

                            const nodeParams: TruckFileNodes = {
                                id: node[0].trim(),
                                x: parseFloat(node[1]),
                                y: parseFloat(node[2]),
                                z: parseFloat(node[3])
                            };

                            if (node[4]) {
                                nodeParams.options = node[4].trim();
                            }

                            this.truckFile.nodes!.push(nodeParams);
                        }
                    } else {
                        this.parserConfig.nodes = false;
                        this.parserConfig.isNextEmptyLine;
                    }
                }
            } catch (error) {
                console.log("nodes exception", error);
                this.parserConfig.nodes = false;
                this.parserConfig.isNextEmptyLine = false;
                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("nodes") || line.startsWith("nodes2")) {
            this.parserConfig.nodes = true;
        }

        /**
         * Beams
         */

        if (this.parserConfig.beams) {
            //console.log(line);
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //TODO add support for nodes2
                //if line doesn't start with a number

                //that's it, we are done here
                this.parserConfig.beams = false;
                this.parserConfig.canParse = false;

                if (line.startsWith("detacher_group")) {
                    this.parserConfig.beams = true;
                }
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        if (line.startsWith("set_beam_defaults")) {
                            if (this.truckFile.setBeamDefaults == undefined) {
                                this.truckFile.setBeamDefaults = [];
                            }

                            const node = line
                                .replace("set_beam_defaults", "")
                                .split(",");

                            //we check for comments and we jump them lol
                            //TODO this is not enough
                            let lineIndex = 0;
                            do {
                                lineIndex++;
                            } while (
                                array[i + lineIndex].startsWith(";") ||
                                array[i + lineIndex].length == 1 ||
                                array[i + lineIndex].startsWith(
                                    "detacher_group"
                                )
                            );

                            this.truckFile.setBeamDefaults.push({
                                after: this.parserConfig.lastLine,
                                before: array[i + lineIndex], //next line lol before we get there
                                springiness: parseInt(node[0]),
                                dampingConstant: parseInt(node[1]),
                                deformationThresholdConstant: parseInt(node[2]),
                                breakingThresholdConstant: parseInt(node[3])
                                /*beamDiameter: parseInt(node[4]),
                                beamMaterial: node[5].trim(),
                                plasticDeformationCoef: parseInt(node[6])*/
                            });

                            //console.log(node);
                        } else {
                            const beam = line.split(",");

                            if (this.truckFile.beams == undefined) {
                                this.truckFile.beams = [];
                            }

                            //console.log(beam);
                            const beamArray: TruckFileBeams = {
                                id: this.beamsIndex,
                                node1: beam[0].trim(),
                                node2: beam[1].trim()
                            };

                            if (beam[2]) {
                                beamArray.options = beam[2].trim();
                            }

                            this.truckFile.beams!.push(beamArray);
                            this.beamsIndex++;
                        }
                    } else {
                        this.parserConfig.beams = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("beams exception", error);
                this.parserConfig.beams = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("beams")) {
            this.parserConfig.beams = true;
        }

        /**
         * Cameras
         */
        if (this.parserConfig.cameras) {
            const cameras = line.split(",");

            if (this.truckFile.cameras == undefined) {
                this.truckFile.cameras = {
                    centerNode: "",
                    backNode: "",
                    leftNode: ""
                };
            }

            this.truckFile.cameras.centerNode = cameras[0].trim();
            this.truckFile.cameras.backNode = cameras[1].trim();
            this.truckFile.cameras.leftNode = cameras[2].trim();

            this.parserConfig.cameras = false;
        }

        if (line.startsWith("cameras")) {
            this.parserConfig.cameras = true;
        }

        /**
         * Cinecam
         */
        if (this.parserConfig.cineCam) {
            const cineCam = line.split(",");

            if (this.truckFile.cineCam == undefined) {
                this.truckFile.cineCam = {
                    x: parseFloat(cineCam[0]),
                    y: parseFloat(cineCam[1]),
                    z: parseFloat(cineCam[2]),
                    node1: cineCam[3].trim(),
                    node2: cineCam[4].trim(),
                    node3: cineCam[5].trim(),
                    node4: cineCam[6].trim(),
                    node5: cineCam[7].trim(),
                    node6: cineCam[8].trim(),
                    node7: cineCam[9].trim(),
                    node8: cineCam[10].trim()
                    //TODO extra stuff
                };
            }

            this.parserConfig.cineCam = false;
        }

        if (line.startsWith("cinecam")) {
            this.parserConfig.cineCam = true;
        }

        /**
         * Wheels2
         */

        if (this.parserConfig.wheels2) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.wheels2 = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const wheels2 = line.split(",");

                            if (this.truckFile.wheels2 == undefined) {
                                this.truckFile.wheels2 = [];
                            }

                            //console.log(beam);
                            const wheels2Array: TruckFileWheels2 = {
                                rimRadius: parseFloat(wheels2[0]),
                                tyreRadius: parseFloat(wheels2[1]),
                                width: parseFloat(wheels2[2]),
                                numRays: parseFloat(wheels2[3]),
                                node1: wheels2[4].trim(),
                                node2: wheels2[5].trim(),
                                rigNode: wheels2[6].trim(),
                                braking: parseFloat(wheels2[7]),
                                drive: parseFloat(wheels2[8]),
                                refArmNode: wheels2[9].trim(),
                                mass: parseFloat(wheels2[10]),
                                rimSpringness: parseFloat(wheels2[11]),
                                rimDamping: parseFloat(wheels2[12]),
                                tyreSpringness: parseFloat(wheels2[13]),
                                tyreDamping: parseFloat(wheels2[14]),
                                material: wheels2[15].trim()
                            };

                            this.truckFile.wheels2!.push(wheels2Array);
                        }
                    } else {
                        this.parserConfig.wheels2 = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("wheels2 exception", error);
                this.parserConfig.wheels2 = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("wheels2")) {
            this.parserConfig.wheels2 = true;
        }

        //Keep this last
        this.parserConfig.lastLine = line;
    }

    saveFile(path: string /*data: TruckFileInterface*/) {
        this.truckFile = store.getters.getTruckData;

        let fileStr = "";
        const lineBreak = " \n";

        fileStr += this.truckFile.info.title;

        fileStr += lineBreak + lineBreak; //extra line breaks

        /**
         * Authors
         */
        if (
            this.truckFile.info.authors &&
            this.truckFile.info.authors.length != 0
        ) {
            this.truckFile.info.authors.forEach(element => {
                fileStr += "author SMTH 01 " + element + lineBreak;
            });

            fileStr += lineBreak; //extra line breaks
        }

        /**
         * globals
         */
        if (this.truckFile.globals) {
            fileStr += "globals" + lineBreak;
            fileStr +=
                this.truckFile.globals.dryMass +
                "," +
                this.truckFile.globals.cargoMass +
                "," +
                this.truckFile.globals.material +
                lineBreak;
        }

        fileStr += lineBreak; //extra line breaks

        /**
         * nodes
         */
        if (this.truckFile.nodes) {
            //TODO register error here
            if (this.truckFile.nodes.length == 0) {
                return false;
            }
            fileStr += "nodes" + lineBreak;

            /**
             *
             * I know this is not efficient
             * But i'm lazy
             * and this is fast way
             * plus we dont care about perf or anything here
             *
             *
             * workaround for set-node-defaults that comes right after the nodes section
             */

            for (let i = 0; i < this.truckFile.nodes.length; i++) {
                const el = this.truckFile.nodes[i];

                if (this.truckFile.setNodesDefaults) {
                    this.truckFile.setNodesDefaults.forEach(sEl => {
                        const beforeNodeId = sEl.before?.split(",")[0]; //we get node id

                        if (beforeNodeId == el.id) {
                            if (sEl.options) {
                                fileStr +=
                                    "set_node_defaults " +
                                    sEl.loadWeight +
                                    ", " +
                                    sEl.friction +
                                    ", " +
                                    sEl.volume +
                                    ", " +
                                    sEl.surface +
                                    ", " +
                                    sEl.options +
                                    lineBreak;
                            } else {
                                fileStr +=
                                    "set_node_defaults " +
                                    sEl.loadWeight +
                                    ", " +
                                    sEl.friction +
                                    ", " +
                                    sEl.volume +
                                    ", " +
                                    sEl.surface +
                                    lineBreak;
                            }
                        }
                    });
                }

                if (el.options) {
                    fileStr +=
                        el.id +
                        ", " +
                        el.x +
                        ", " +
                        el.y +
                        ", " +
                        el.z +
                        ", " +
                        el.options +
                        lineBreak;
                } else {
                    fileStr +=
                        el.id +
                        ", " +
                        el.x +
                        ", " +
                        el.y +
                        ", " +
                        el.z +
                        lineBreak;
                }
            }
        }

        fileStr += lineBreak; //extra line breaks

        /**
         * Beams
         */
        if (this.truckFile.beams) {
            //TODO register error here
            if (this.truckFile.beams.length == 0) {
                return false;
            }
            console.log(this.truckFile.setBeamDefaults);

            fileStr += "beams" + lineBreak;

            for (let i = 0; i < this.truckFile.beams.length; i++) {
                const el = this.truckFile.beams[i];

                if (this.truckFile.setBeamDefaults) {
                    this.truckFile.setBeamDefaults.forEach(sEl => {
                        const beforeBeamCouple = sEl.before?.split(","); //we get node id

                        if (beforeBeamCouple == undefined) {
                            return;
                        }

                        if (
                            beforeBeamCouple[0] == el.node1 &&
                            beforeBeamCouple[1] == el.node2
                        ) {
                            fileStr +=
                                "set_beam_defaults " +
                                sEl.springiness +
                                ", " +
                                sEl.dampingConstant +
                                ", " +
                                sEl.deformationThresholdConstant +
                                ", " +
                                sEl.breakingThresholdConstant +
                                lineBreak;
                        }
                    });
                }

                /* if (el.options) {
                    fileStr +=
                        el.node1 +
                        ", " +
                        el.node2 +
                        ", " +
                        el.options +
                        lineBreak;
                } else {
                    fileStr += el.node1 + ", " + el.node2 + ", " + lineBreak; //TODO should i leave that or no
                }*/

                fileStr += el.node1 + ", " + el.node2 + ", v" + lineBreak;
            }
        }

        fileStr += lineBreak;

        /**
         * cameras
         */
        if (this.truckFile.cameras) {
            fileStr += "cameras" + lineBreak;
            fileStr +=
                this.truckFile.cameras.centerNode +
                "," +
                this.truckFile.cameras.backNode +
                "," +
                this.truckFile.cameras.leftNode +
                lineBreak;
        }

        fileStr += lineBreak;

        /**
         * cinecam
         */
        if (this.truckFile.cineCam) {
            fileStr += "cinecam" + lineBreak;
            fileStr +=
                this.truckFile.cineCam.x +
                "," +
                this.truckFile.cineCam.y +
                "," +
                this.truckFile.cineCam.z +
                "," +
                this.truckFile.cineCam.node1 +
                "," +
                this.truckFile.cineCam.node2 +
                "," +
                this.truckFile.cineCam.node3 +
                "," +
                this.truckFile.cineCam.node4 +
                "," +
                this.truckFile.cineCam.node5 +
                "," +
                this.truckFile.cineCam.node6 +
                "," +
                this.truckFile.cineCam.node7 +
                "," +
                this.truckFile.cineCam.node8 +
                //TODO cinecam extras
                lineBreak;
        }

        fileStr += lineBreak; //extra line breaks

        /**
         * Wheels2
         */
        if (this.truckFile.wheels2) {
            fileStr += "wheels2" + lineBreak;
            for (let i = 0; i < this.truckFile.wheels2.length; i++) {
                const currWheels2 = this.truckFile.wheels2[i];

                fileStr +=
                    currWheels2.rimRadius +
                    ", " +
                    currWheels2.tyreRadius +
                    ", " +
                    currWheels2.width +
                    ", " +
                    currWheels2.numRays +
                    ", " +
                    currWheels2.node1 +
                    ", " +
                    currWheels2.node2 +
                    ", " +
                    currWheels2.rigNode +
                    ", " +
                    currWheels2.braking +
                    ", " +
                    currWheels2.drive +
                    ", " +
                    currWheels2.refArmNode +
                    ", " +
                    currWheels2.mass +
                    ", " +
                    currWheels2.rimSpringness +
                    ", " +
                    currWheels2.rimDamping +
                    ", " +
                    currWheels2.tyreSpringness +
                    ", " +
                    currWheels2.tyreDamping +
                    ", " +
                    currWheels2.material +
                    lineBreak;
            }
        }

        fileStr += lineBreak; //extra line breaks

        fs.writeFileSync("C:/Users/Moncef/Desktop/test.truck", fileStr);
    }
}
