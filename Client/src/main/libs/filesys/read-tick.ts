import fs from "fs";
import path from "path";
import {PlatformUser} from "../../../shared/src/types/user";
import {profileFolderPath} from "./common";

export async function readTick(platform: PlatformUser, map: string): Promise<number | undefined> {
    const profileFolder = profileFolderPath(platform);

    try {
        const cycleFile = fs.readFileSync(path.join(profileFolder, `${map}.xsdat`), {flag: "a+", encoding: null});
        return Buffer.from(cycleFile).readInt32LE();
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ERROR and file doesn't have to exist.
    }
    return undefined;
}
