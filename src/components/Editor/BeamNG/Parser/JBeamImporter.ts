import fs from "fs";
//@ts-ignore
//import { toJson } from "really-relaxed-json";
import rjson from "@/components/js/rjson.js";

export default class JBeamImporter {
    constructor() {
        console.log("hai!");
    }

    loadFile(path: string) {
        const data = fs
            .readFileSync("C:\\Users\\Moncef\\Desktop\\beamng\\test.jbeam")
            .toString();

        const jbeam: any[any] = rjson.parse(data, {
            tolerant: true,
            relaxed: true,
            warnings: true,
            duplicate: true
        });

        console.log(jbeam);

        return jbeam;
    }
}
