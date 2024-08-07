import fs from "fs";
import path from "path";
import {Mod} from "../../../shared/src/types/mods";
import {modsFolderPath} from "./common";
import {PlatformUser} from "../../../shared/src/types/user";

/**
 * Reads the mods-status.json in the mods directory and returns a list of all installed mods
 * @param platform
 */
export async function readModsJson(platform: PlatformUser): Promise<Array<Mod>> {
    const modsFolder = modsFolderPath(platform);

    let mods: Array<Mod> = [];
    if (fs.existsSync(modsFolder)) {
        try {
            mods = (JSON.parse(fs.readFileSync(path.join(modsFolder, "mod-status.json")).toString()))["Mods"] ?? [];
        } catch {}
    }

    mods.push({
        CheckSum: "",
        Enabled: true,
        LastUpdate: "",
        Path: "..",
        Priority: mods.length + 1, // profile folder's "mod" has the lowest priority
        PublishID: -1,
        Title: "",
        WorkshopID: -1,
    });

    return mods;
}
