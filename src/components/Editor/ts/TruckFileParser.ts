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
 * flexbodies
 */
export interface TruckFileFlexbodies {
    refNode: string;
    xNode: string;
    yNode: string;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    meshName: string;
    forset: string;
    disableFlexbodyShadow?: boolean;
    flexbodyCameraMode?: number;
}

/**
 * Animators
 */
export interface TruckFileAnimators {
    node1: string;
    node2: string;
    factor: number;
    option: string;
}

/**
 * Shocks
 */
export interface TruckFileShocks {
    node1: string;
    node2: string;
    springRate: number;
    damping: number;
    maxContraction: number;
    maxExtention: number;
    preCompression: number;
    options?: string;
}

/**
 * Hydros
 */
export interface TruckFileHydros {
    node1: string;
    node2: string;
    lengtheningFactor: number;
    options?: string;
    startDelay?: number;
    stopDelay?: number;
    startFunction?: string;
    stopFunction?: string;
}

/**
 * Commands
 */
export interface TruckFileCommands {
    node1: string;
    node2: string;
    rateFactor: number;
    maxContraction: number;
    maxExtention: number;

    contractionKey: number;
    extentionKey: number;

    option?: string;
    description?: string;
}

/**
 * Commands2
 */
export interface TruckFileCommands2 {
    node1: string;
    node2: string;
    contractionRateFactor: number;
    extentionRateFactor: number;

    maxContraction: number;
    maxExtention: number;

    contractionKey: number;
    extentionKey: number;

    option?: string;
    description?: string;

    startDelay?: number;
    stopDelay?: number;
    startFunction?: string;
    stropFunction?: string;

    affectEngine?: number;
    needEngine?: boolean;
}

/**
 * Slidenodes
 */
export interface TruckFileSlideNodes {
    node1: string;
    node2: string;
    node3: string;
}

/**
 * Wheels
 * rorEditor will use this as default wheels
 */
export interface TruckFileWheels {
    radius: number;
    width: number;
    numRays: number;
    node1: string;
    node2: string;
    rigNode: string;
    braking: number;
    drive: number;
    refArmNode: string;
    mass: number;
    springness: number;
    damping: number;
    material: string;
}

/**
 * Wheels2
 *
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
    coeff?: number;
}

/**
 * Fusedrag
 */

export interface TruckFileFuseDrag {
    frontNode: string;
    backNode: string;
    fuselageWidth: number;
    airfoil: string;
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
    node1: string;
    node2: string;
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
    wheels?: TruckFileWheels[];

    slidenodes?: TruckFileSlideNodes[];
    shocks?: TruckFileShocks[];
    commands?: TruckFileCommands[];
    commands2?: TruckFileCommands2[];
    hydros?: TruckFileHydros[];
    animators?: TruckFileAnimators[];
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
        wheels: false,
        wheels2: false,
        shocks: false,
        hydros: false,
        commands: false,
        commands2: false,

        /**
         * Planes specific
         */
        fusedrag: false,
        turboJet: false,
        turboProp: false,
        pistonProp: false,
        wings: false,

        /**
         * other stuff
         */
        slidenodes: false,
        setBeamDefaults: false,
        animators: false
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

        //this.processFileForEditor();

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
         * Wheels
         */

        if (this.parserConfig.wheels) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.wheels = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const wheels = line.split(",");

                            if (this.truckFile.wheels == undefined) {
                                this.truckFile.wheels = [];
                            }

                            //console.log(beam);
                            const wheelsArray: TruckFileWheels = {
                                radius: parseFloat(wheels[0]),
                                width: parseFloat(wheels[1]),
                                numRays: parseFloat(wheels[2]),
                                node1: wheels[3].trim(),
                                node2: wheels[4].trim(),
                                rigNode: wheels[5].trim(),
                                braking: parseFloat(wheels[6]),
                                drive: parseFloat(wheels[7]),
                                refArmNode: wheels[8].trim(),
                                mass: parseFloat(wheels[9]),
                                springness: parseFloat(wheels[10]),
                                damping: parseFloat(wheels[11]),
                                material: wheels[12].trim()
                            };

                            this.truckFile.wheels!.push(wheelsArray);
                        }
                    } else {
                        this.parserConfig.wheels = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("wheels exception", error);
                this.parserConfig.wheels = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("wheels")) {
            this.parserConfig.wheels = true;
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

        /**
         * Wings
         */

        if (this.parserConfig.wings) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.wings = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const wings = line.split(",");

                            if (this.truckFile.wings == undefined) {
                                this.truckFile.wings = [];
                            }

                            //console.log(beam);
                            const wingsArray: TruckFileWings = {
                                nodeA: wings[0].trim(),
                                nodeB: wings[1].trim(),
                                nodeC: wings[2].trim(),
                                nodeD: wings[3].trim(),
                                nodeE: wings[4].trim(),
                                nodeF: wings[5].trim(),
                                nodeG: wings[6].trim(),
                                nodeH: wings[7].trim(),
                                frontLeftX: parseFloat(wings[8]),
                                frontLeftY: parseFloat(wings[9]),
                                frontRightX: parseFloat(wings[10]),
                                frontRightY: parseFloat(wings[11]),
                                backLeftX: parseFloat(wings[12]),
                                backLeftY: parseFloat(wings[13]),
                                backRightX: parseFloat(wings[14]),
                                backRightY: parseFloat(wings[15]),

                                controlType: wings[16].trim(),
                                chordControlStart: parseFloat(wings[17]),
                                minDeflection: parseFloat(wings[18]),
                                maxDeflection: parseFloat(wings[19]),
                                airfoil: wings[20].trim().split(" ")[0]
                            };

                            if (wings[20].trim().split(" ")[1]) {
                                wingsArray.coeff = parseFloat(
                                    wings[20].trim().split(" ")[1]
                                );
                            }

                            this.truckFile.wings!.push(wingsArray);
                        }
                    } else {
                        this.parserConfig.wings = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("wheels2 exception", error);
                this.parserConfig.wings = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("wings")) {
            this.parserConfig.wings = true;
        }

        /**
         * Turbojets
         */

        if (this.parserConfig.turboJet) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.turboJet = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const currTurboJet = line.split(",");

                            if (this.truckFile.turboJet == undefined) {
                                this.truckFile.turboJet = [];
                            }
                            const turboJetsArray: TruckFileTurboJets = {
                                frontNode: currTurboJet[0].trim(),
                                backNode: currTurboJet[1].trim(),
                                sideNode: currTurboJet[2].trim(),
                                isReversable: currTurboJet[3].trim() == "1",
                                dryThrust: parseFloat(currTurboJet[4]),
                                wetThrust: parseFloat(currTurboJet[5]),
                                frontDiameter: parseFloat(currTurboJet[6]),
                                backDiameter: parseFloat(currTurboJet[7]),
                                nozzleLenght: parseFloat(currTurboJet[8])
                            };

                            this.truckFile.turboJet!.push(turboJetsArray);
                        }
                    } else {
                        this.parserConfig.turboJet = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("turbojets exception", error);
                this.parserConfig.turboJet = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("turbojets")) {
            this.parserConfig.turboJet = true;
        }

        /**
         * fusedrag
         */
        if (this.parserConfig.fusedrag) {
            const fusedrag = line.split(",");

            if (this.truckFile.fusedrag == undefined) {
                this.truckFile.fusedrag = {
                    frontNode: "",
                    backNode: "",
                    fuselageWidth: 1,
                    airfoil: "NACA0009.afl"
                };
            }

            this.truckFile.fusedrag.frontNode = fusedrag[0].trim();
            this.truckFile.fusedrag.backNode = fusedrag[1].trim();
            this.truckFile.fusedrag.fuselageWidth = parseFloat(fusedrag[2]);
            if (fusedrag[3])
                this.truckFile.fusedrag.airfoil = fusedrag[3].trim();

            this.parserConfig.fusedrag = false;
        }

        if (line.startsWith("fusedrag")) {
            this.parserConfig.fusedrag = true;
        }

        /**
         * Slidenodes
         */

        if (this.parserConfig.slidenodes) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.slidenodes = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const slidenodes = line.split(",");

                            if (this.truckFile.slidenodes == undefined) {
                                this.truckFile.slidenodes = [];
                            }
                            const slideNodesArray: TruckFileSlideNodes = {
                                node1: slidenodes[0].trim(),
                                node2: slidenodes[1].trim(),
                                node3: slidenodes[2].trim()
                            };

                            this.truckFile.slidenodes!.push(slideNodesArray);
                        }
                    } else {
                        this.parserConfig.slidenodes = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("slidenodes exception", error);
                this.parserConfig.slidenodes = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("slidenodes")) {
            this.parserConfig.slidenodes = true;
        }

        /**
         * Shocks
         */

        if (this.parserConfig.shocks) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.shocks = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const shocks = line.split(",");

                            if (this.truckFile.shocks == undefined) {
                                this.truckFile.shocks = [];
                            }
                            const shocksArray: TruckFileShocks = {
                                node1: shocks[0].trim(),
                                node2: shocks[1].trim(),
                                springRate: parseFloat(shocks[2]),
                                damping: parseFloat(shocks[3]),
                                maxContraction: parseFloat(shocks[4]),
                                maxExtention: parseFloat(shocks[5]),
                                preCompression: parseFloat(shocks[6])
                            };

                            if (shocks[7]) {
                                shocksArray.options = shocks[7].trim();
                            }

                            this.truckFile.shocks!.push(shocksArray);
                        }
                    } else {
                        this.parserConfig.shocks = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("shocks exception", error);
                this.parserConfig.shocks = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("shocks")) {
            this.parserConfig.shocks = true;
        }

        /**
         * hydros
         */

        if (this.parserConfig.hydros) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.hydros = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const hydros = line.split(",");

                            if (this.truckFile.hydros == undefined) {
                                this.truckFile.hydros = [];
                            }
                            const hydrosArray: TruckFileHydros = {
                                node1: hydros[0].trim(),
                                node2: hydros[1].trim(),
                                lengtheningFactor: parseFloat(hydros[2])
                            };

                            if (hydros[3]) {
                                hydrosArray.options = hydros[3].trim();
                            }

                            if (hydros[4]) {
                                hydrosArray.startDelay = parseFloat(hydros[4]);
                            }
                            if (hydros[5]) {
                                hydrosArray.stopDelay = parseFloat(hydros[5]);
                            }
                            if (hydros[6]) {
                                hydrosArray.startFunction = hydros[6]
                                    .trim()
                                    .split(" ")[0];
                                if (hydros[6].trim().split(" ")[1])
                                    hydrosArray.stopFunction = hydros[6]
                                        .trim()
                                        .split(" ")[1];
                            }

                            this.truckFile.hydros!.push(hydrosArray);
                        }
                    } else {
                        this.parserConfig.hydros = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("hydros exception", error);
                this.parserConfig.hydros = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.startsWith("hydros")) {
            this.parserConfig.hydros = true;
        }

        /**
         * commands
         */

        if (this.parserConfig.commands) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.commands = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const commands = line.split(",");

                            if (this.truckFile.commands == undefined) {
                                this.truckFile.commands = [];
                            }
                            const commandsArray: TruckFileCommands = {
                                node1: commands[0].trim(),
                                node2: commands[1].trim(),
                                rateFactor: parseFloat(commands[2]),
                                maxContraction: parseFloat(commands[3]),
                                maxExtention: parseFloat(commands[4]),
                                contractionKey: parseFloat(commands[5]),
                                extentionKey: parseFloat(commands[5])
                            };

                            if (commands[6]) {
                                commandsArray.option = commands[6].trim();
                            }

                            if (commands[7]) {
                                commandsArray.description = commands[7].trim();
                            }

                            this.truckFile.commands!.push(commandsArray);
                        }
                    } else {
                        this.parserConfig.commands = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("commands exception", error);
                this.parserConfig.commands = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.trim() == "commands") {
            this.parserConfig.commands = true;
        }

        /**
         * commands2
         */

        if (this.parserConfig.commands2) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.commands2 = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const commands2 = line.split(",");

                            if (this.truckFile.commands2 == undefined) {
                                this.truckFile.commands2 = [];
                            }
                            const commands2Array: TruckFileCommands2 = {
                                node1: commands2[0].trim(),
                                node2: commands2[1].trim(),
                                contractionRateFactor: parseFloat(commands2[2]),
                                extentionRateFactor: parseFloat(commands2[3]),
                                maxContraction: parseFloat(commands2[4]),
                                maxExtention: parseFloat(commands2[5]),
                                contractionKey: parseFloat(commands2[6]),
                                extentionKey: parseFloat(commands2[7])
                            };

                            if (commands2[8]) {
                                commands2Array.option = commands2[8].trim();
                            }

                            if (commands2[9]) {
                                commands2Array.description = commands2[9].trim();
                            }

                            if (commands2[10]) {
                                commands2Array.startDelay = parseFloat(
                                    commands2[10]
                                );
                            }

                            if (commands2[11]) {
                                commands2Array.stopDelay = parseFloat(
                                    commands2[11]
                                );
                            }

                            if (commands2[12]) {
                                commands2Array.startFunction = commands2[12].trim();
                            }

                            if (commands2[13]) {
                                commands2Array.stropFunction = commands2[13].trim();
                            }

                            if (commands2[14]) {
                                commands2Array.affectEngine = parseFloat(
                                    commands2[14]
                                );
                            }

                            if (commands2[15]) {
                                commands2Array.needEngine =
                                    commands2[15] == "true";
                            }

                            this.truckFile.commands2!.push(commands2Array);
                        }
                    } else {
                        this.parserConfig.commands2 = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("commands2 exception", error);
                this.parserConfig.commands2 = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.trim() == "commands2") {
            this.parserConfig.commands2 = true;
        }

        /**
         * animators
         */

        if (this.parserConfig.animators) {
            this.parserConfig.canParse = true;

            if (line.split(",").length == 1) {
                //if line doesn't start with a number
                //that's it, we are done here

                this.parserConfig.animators = false;
                this.parserConfig.canParse = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        {
                            const animators = line.split(",");

                            if (this.truckFile.animators == undefined) {
                                this.truckFile.animators = [];
                            }
                            const animatorsArray: TruckFileAnimators = {
                                node1: animators[0].trim(),
                                node2: animators[1].trim(),
                                factor: parseFloat(animators[2]),
                                option: animators[3].trim()
                            };

                            this.truckFile.animators!.push(animatorsArray);
                        }
                    } else {
                        this.parserConfig.animators = false;
                        this.parserConfig.isNextEmptyLine = false;
                    }
                }
            } catch (error) {
                console.log("animators exception", error);
                this.parserConfig.animators = false;
                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        if (line.trim() == "animators") {
            this.parserConfig.animators = true;
        }

        /**
         * set_beam_defaults
         */

        if (line.startsWith("set_beam_defaults") && !this.parserConfig.beams) {
            try {
                if (this.truckFile.setBeamDefaults == undefined) {
                    this.truckFile.setBeamDefaults = [];
                }
                const node = line.replace("set_beam_defaults", "").split(",");

                //we check for comments and we jump them lol
                //TODO this is not enough
                let lineIndex = 0;
                do {
                    lineIndex++;
                } while (array[i + lineIndex].startsWith(";"));

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
            } catch (error) {
                console.log("setBeamDefaults exception", error);

                this.parserConfig.isNextEmptyLine = false;

                this.parserConfig.canParse = false;
            }
        }

        //Keep this last
        this.parserConfig.lastLine = line;
    }

    /*processFileForEditor() {

    }*/

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

                //fileStr += this.truckFile.nodes?.filter(currNode => currNode.idEditor == el.node1)[0].id + ", " + el.node2 + ", v" + lineBreak;
                fileStr +=
                    this.getNodeRealId(el.node1) +
                    ", " +
                    this.getNodeRealId(el.node2) +
                    ", v" +
                    lineBreak;
            }
        }

        fileStr += lineBreak;

        /**
         * cameras
         */
        if (this.truckFile.cameras) {
            fileStr += "cameras" + lineBreak;
            fileStr +=
                this.getNodeRealId(this.truckFile.cameras.centerNode) +
                ", " +
                this.getNodeRealId(this.truckFile.cameras.backNode) +
                ", " +
                this.getNodeRealId(this.truckFile.cameras.leftNode) +
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
                ", " +
                this.truckFile.cineCam.y +
                ", " +
                this.truckFile.cineCam.z +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node1) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node2) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node3) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node4) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node5) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node6) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node7) +
                ", " +
                this.getNodeRealId(this.truckFile.cineCam.node8) +
                //TODO cinecam extras
                lineBreak;
        }

        fileStr += lineBreak; //extra line breaks

        /**
         * Wheels
         */
        if (this.truckFile.wheels) {
            fileStr += "wheels" + lineBreak;
            for (let i = 0; i < this.truckFile.wheels.length; i++) {
                const currWheels = this.truckFile.wheels[i];

                fileStr +=
                    currWheels.radius +
                    ", " +
                    currWheels.width +
                    ", " +
                    currWheels.numRays +
                    ", " +
                    this.getNodeRealId(currWheels.node1) +
                    ", " +
                    this.getNodeRealId(currWheels.node2) +
                    ", " +
                    currWheels.rigNode +
                    ", " +
                    currWheels.braking +
                    ", " +
                    currWheels.drive +
                    ", " +
                    currWheels.refArmNode +
                    ", " +
                    currWheels.mass +
                    ", " +
                    currWheels.springness +
                    ", " +
                    currWheels.damping +
                    ", " +
                    currWheels.material +
                    lineBreak;
            }
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
                    this.getNodeRealId(currWheels2.node1) +
                    ", " +
                    this.getNodeRealId(currWheels2.node2) +
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

        /**
         * Wings
         */
        if (this.truckFile.wings) {
            fileStr += "wings" + lineBreak;
            for (let i = 0; i < this.truckFile.wings.length; i++) {
                const currWings = this.truckFile.wings[i];

                fileStr +=
                    this.getNodeRealId(currWings.nodeA) +
                    ", " +
                    this.getNodeRealId(currWings.nodeB) +
                    ", " +
                    this.getNodeRealId(currWings.nodeC) +
                    ", " +
                    this.getNodeRealId(currWings.nodeD) +
                    ", " +
                    this.getNodeRealId(currWings.nodeE) +
                    ", " +
                    this.getNodeRealId(currWings.nodeF) +
                    ", " +
                    this.getNodeRealId(currWings.nodeG) +
                    ", " +
                    this.getNodeRealId(currWings.nodeH) +
                    ", " +
                    currWings.frontLeftX +
                    ", " +
                    currWings.frontLeftY +
                    ", " +
                    currWings.frontRightX +
                    ", " +
                    currWings.frontRightY +
                    ", " +
                    currWings.backLeftX +
                    ", " +
                    currWings.backLeftY +
                    ", " +
                    currWings.backRightX +
                    ", " +
                    currWings.backRightY +
                    ", " +
                    currWings.controlType +
                    ", " +
                    currWings.chordControlStart +
                    ", " +
                    currWings.minDeflection +
                    ", " +
                    currWings.maxDeflection +
                    ", " +
                    currWings.airfoil;

                if (currWings.coeff) {
                    fileStr += " " + currWings.coeff;
                }

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * Trubojets
         */
        if (this.truckFile.turboJet) {
            fileStr += "turbojets" + lineBreak;
            for (let i = 0; i < this.truckFile.turboJet.length; i++) {
                const currTruboJet = this.truckFile.turboJet[i];

                fileStr +=
                    this.getNodeRealId(currTruboJet.frontNode) +
                    ", " +
                    this.getNodeRealId(currTruboJet.backNode) +
                    ", " +
                    this.getNodeRealId(currTruboJet.sideNode) +
                    ", " +
                    (currTruboJet.isReversable ? "1" : "0") +
                    ", " +
                    currTruboJet.dryThrust +
                    ", " +
                    currTruboJet.wetThrust +
                    ", " +
                    currTruboJet.frontDiameter +
                    ", " +
                    currTruboJet.backDiameter +
                    ", " +
                    currTruboJet.nozzleLenght +
                    lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * fusedrag
         */
        if (this.truckFile.fusedrag) {
            fileStr += "fusedrag" + lineBreak;
            fileStr +=
                this.getNodeRealId(this.truckFile.fusedrag.frontNode) +
                ", " +
                this.getNodeRealId(this.truckFile.fusedrag.backNode) +
                ", " +
                this.truckFile.fusedrag.fuselageWidth +
                ", " +
                this.truckFile.fusedrag.airfoil +
                lineBreak;
        }

        fileStr += lineBreak; //extra line breaks

        /**
         * Slidenodes
         */
        if (this.truckFile.slidenodes) {
            fileStr += "slidenodes" + lineBreak;
            for (let i = 0; i < this.truckFile.slidenodes.length; i++) {
                const slidenodes = this.truckFile.slidenodes[i];

                fileStr +=
                    this.getNodeRealId(slidenodes.node1) +
                    ", " +
                    this.getNodeRealId(slidenodes.node2) +
                    ", " +
                    this.getNodeRealId(slidenodes.node3) +
                    lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * hydros
         */
        if (this.truckFile.hydros) {
            fileStr += "hydros" + lineBreak;
            for (let i = 0; i < this.truckFile.hydros.length; i++) {
                const hydros = this.truckFile.hydros[i];

                fileStr +=
                    this.getNodeRealId(hydros.node1) +
                    ", " +
                    this.getNodeRealId(hydros.node2) +
                    ", " +
                    hydros.lengtheningFactor +
                    ", " +
                    hydros.options;

                if (hydros.startDelay) {
                    fileStr += ", " + hydros.startDelay;
                }
                if (hydros.stopDelay) {
                    fileStr += ", " + hydros.stopDelay;
                }
                if (hydros.startFunction) {
                    fileStr += ", " + hydros.startFunction;
                    if (hydros.stopFunction) {
                        fileStr += " " + hydros.stopFunction;
                    }
                }

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * commands
         */
        if (this.truckFile.commands) {
            fileStr += "commands" + lineBreak;
            for (let i = 0; i < this.truckFile.commands.length; i++) {
                const commands = this.truckFile.commands[i];

                fileStr +=
                    this.getNodeRealId(commands.node1) +
                    ", " +
                    this.getNodeRealId(commands.node2) +
                    ", " +
                    commands.rateFactor +
                    ", " +
                    commands.maxContraction +
                    ", " +
                    commands.maxExtention +
                    ", " +
                    commands.contractionKey +
                    ", " +
                    commands.extentionKey;

                if (commands.option) {
                    fileStr += ", " + commands.option;

                    if (commands.description) {
                        fileStr += ", " + commands.description;
                    }
                }

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * commands2
         */
        if (this.truckFile.commands2) {
            fileStr += "commands2" + lineBreak;
            for (let i = 0; i < this.truckFile.commands2.length; i++) {
                const commands2 = this.truckFile.commands2[i];

                fileStr +=
                    this.getNodeRealId(commands2.node1) +
                    ", " +
                    this.getNodeRealId(commands2.node2) +
                    ", " +
                    commands2.contractionRateFactor +
                    ", " +
                    commands2.extentionRateFactor +
                    ", " +
                    commands2.maxContraction +
                    ", " +
                    commands2.maxExtention +
                    ", " +
                    commands2.contractionKey +
                    ", " +
                    commands2.extentionKey;

                if (commands2.option) {
                    fileStr += ", " + commands2.option;

                    if (commands2.description) {
                        fileStr += ", " + commands2.description;
                    }
                }

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * shocks
         */
        if (this.truckFile.shocks) {
            fileStr += "shocks" + lineBreak;
            for (let i = 0; i < this.truckFile.shocks.length; i++) {
                const shocks = this.truckFile.shocks[i];

                fileStr +=
                    this.getNodeRealId(shocks.node1) +
                    ", " +
                    this.getNodeRealId(shocks.node2) +
                    ", " +
                    shocks.springRate +
                    ", " +
                    shocks.damping +
                    ", " +
                    shocks.maxContraction +
                    ", " +
                    shocks.maxExtention +
                    ", " +
                    shocks.preCompression;

                if (shocks.options) {
                    fileStr += ", " + shocks.options;
                }

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        /**
         * Animators
         */
        if (this.truckFile.animators) {
            fileStr += "animators" + lineBreak;
            for (let i = 0; i < this.truckFile.animators.length; i++) {
                const animators = this.truckFile.animators[i];

                fileStr +=
                    this.getNodeRealId(animators.node1) +
                    ", " +
                    this.getNodeRealId(animators.node2) +
                    ", " +
                    animators.factor +
                    ", " +
                    animators.option;

                fileStr += lineBreak;
            }
        }
        fileStr += lineBreak;

        fileStr += "end";

        fs.writeFileSync("C:/Users/Moncef/Desktop/test.truck", fileStr);
    }

    private getNodeRealId(str: string): string {
        //console.log(str);
        return this.truckFile.nodes?.filter(
            currNode => currNode.idEditor == parseInt(str)
        )[0].id!;
    }
}
