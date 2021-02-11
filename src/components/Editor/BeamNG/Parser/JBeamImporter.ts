import fs from "fs";
//@ts-ignore
//import { toJson } from "really-relaxed-json";
import rjson from "@/components/js/rjson.js";

export default class JBeamImporter {
    constructor() {
        console.log("hai!");
    }

    loadFile(path: string) {
        let str = "{ \n";

        fs.readdirSync("C:\\Users\\Moncef\\Desktop\\beamng\\barstow").forEach(
            el => {
                if (el.split(".")[1] != "jbeam") return;

                let tempStr = fs
                    .readFileSync(
                        "C:\\Users\\Moncef\\Desktop\\beamng\\barstow\\" + el
                    )
                    .toString()
                    .substring(1);

                tempStr = tempStr.substring(1);

                /**
                 * removing a common mistake found in jbeams
                 * trailing } at the end of the file
                 */
                if (
                    tempStr.charAt(tempStr.length - 1) == "}" &&
                    tempStr.charAt(tempStr.length - 5) == "}" &&
                    tempStr.charAt(tempStr.length - 9) == "}"
                )
                    tempStr = tempStr.slice(0, -5);
                else tempStr = tempStr.slice(0, -1);

                str += tempStr + "\n";
            }
        );

        str += "}";

        const jbeam: any[any] = rjson.parse(str, {
            tolerant: true,
            relaxed: true,
            warnings: true,
            duplicate: true
        });

        fs.writeFileSync(
            "C:\\Users\\Moncef\\Desktop\\beamng\\test.json",
            JSON.stringify(jbeam, null, 1)
        );

        console.log(jbeam);

        return jbeam;
    }

    public loadPCData() {
        const pcFiles: string[] = [];

        fs.readdirSync("C:\\Users\\Moncef\\Desktop\\beamng\\barstow").forEach(
            el => {
                if (el.split(".")[1] != "pc") {
                    return;
                }
                pcFiles.push(el);
            }
        );

        const pcData: { title: string; data: any }[] = [];

        pcFiles.forEach(el => {
            const str = fs
                .readFileSync(
                    "C:\\Users\\Moncef\\Desktop\\beamng\\barstow\\" + el
                )
                .toString();

            pcData.push({
                title: el,
                data: rjson.parse(str, {
                    tolerant: true,
                    relaxed: true,
                    warnings: true,
                    duplicate: true
                })
            });
        });

        console.log(pcData);
        return pcData;
    }
}
