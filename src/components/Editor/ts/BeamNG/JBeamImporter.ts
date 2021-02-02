import fs from "fs";
//@ts-ignore
import { toJson } from "really-relaxed-json";

export default class JBeamImporter {
    constructor() {
        const data = fs
            .readFileSync("C:\\Users\\Moncef\\Desktop\\beamng\\test.jbeam")
            .toString();

        const jbeam: any[any] = JSON.parse(toJson(data));

        console.log(jbeam);

        for (const [key, value] of Object.entries(jbeam)) {
            const currValue = value as any;
            console.log(currValue["beams"]);
        }
    }
}
