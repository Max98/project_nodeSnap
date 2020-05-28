import readline from "readline";
import fs from "fs";

/**
 * Truck file header
 */
interface TruckFileInfo {
    title: string;
    authors: string[];
}

/**
 * Globals
 */
interface TruckFileGlobals {
    dryMass: number;
    cargoMass: number;
    material: string;
}

/**
 * Nodes
 */

export interface TruckFileNodes {
    id: string | number;
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
    id?: string | number;
}

/**
 * The whole truck file interface
 */
export interface TruckFileInterface {
    info: TruckFileInfo;
    globals: TruckFileGlobals;
    nodes?: TruckFileNodes[];
    beams?: TruckFileBeams[];
}

export default class TruckFileLoad {
    private truckFile: TruckFileInterface = {
        info: { title: "", authors: [] },
        globals: { cargoMass: 1, dryMass: 1, material: "" }
    };

    private parserConfig = {
        isNextEmptyLine: false,
        globals: false,
        nodes: false,
        beams: false,
        canParse: false
    };

    getTruckFileObject() {
        return this.truckFile;
    }

    loadFile() {
        const array = fs
            .readFileSync("C:/YB35.airplane", "utf8")
            .toString()
            .split("\n");

        array.forEach((value, i) => {
            this.parseTruckFile(value, i);
        });

        //console.log(this.truckFile);

        return true;
    }

    private parseTruckFile(line: string, i: number) {
        /**
         * Title
         */
        if (i == 0) {
            console.log("title", line);
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
            this.parserConfig.canParse = true;
            if (
                line.startsWith(" ") ||
                line.length == 1 ||
                this.parserConfig.isNextEmptyLine
            ) {
                if (this.parserConfig.isNextEmptyLine) {
                    //TODO add support for nodes2
                    //if line doesn't start with a number

                    if (line.split(",").length == 1) {
                        this.parserConfig.isNextEmptyLine = false;

                        //that's it, we are done here
                        this.parserConfig.nodes = false;
                        this.parserConfig.canParse = false;
                    } else {
                        this.parserConfig.isNextEmptyLine = false;
                    }
                } else {
                    this.parserConfig.isNextEmptyLine = true;
                    this.parserConfig.canParse = false;
                }
            } else {
                this.parserConfig.isNextEmptyLine = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        const node = line.split(",");
                        if (this.truckFile.nodes == undefined) {
                            this.truckFile.nodes = [];
                        }
                        this.truckFile.nodes!.push({
                            id: node[0].trim(),
                            x: parseFloat(node[1]),
                            y: parseFloat(node[2]),
                            z: parseFloat(node[3]),
                            options: node[4].trim()
                        });
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
            if (
                line.startsWith(" ") ||
                line.length == 1 ||
                this.parserConfig.isNextEmptyLine
            ) {
                if (this.parserConfig.isNextEmptyLine) {
                    //if line doesn't start with a number

                    if (line.split(",").length == 1) {
                        this.parserConfig.isNextEmptyLine = false;

                        //that's it, we are done here
                        this.parserConfig.beams = false;
                        this.parserConfig.canParse = false;
                    } else {
                        this.parserConfig.isNextEmptyLine = false;
                    }
                } else {
                    this.parserConfig.isNextEmptyLine = true;
                    this.parserConfig.canParse = false;
                }
            } else {
                this.parserConfig.isNextEmptyLine = false;
            }

            try {
                if (this.parserConfig.canParse) {
                    if (line.split(",").length != 1) {
                        const beam = line.split(",");

                        if (this.truckFile.beams == undefined) {
                            this.truckFile.beams = [];
                        }

                        //console.log(beam);

                        this.truckFile.beams!.push({
                            node1: beam[0].trim(),
                            node2: beam[1].trim(),
                            options: beam[3]
                        });
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
    }
}
