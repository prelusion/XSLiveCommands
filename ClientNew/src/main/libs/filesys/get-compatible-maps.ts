import fs from "fs";
import path from "path";
import {MapName, MapPath} from "../../../shared/src/types/commands/structs";
import {PlatformUser} from "../../../shared/src/types/user";
import {recursiveReaddir} from "../../util/general";
import {modsFolderPath} from "./common";

/**
 * Gets the names of all the scenarios & RMS files in the mod folder specified that support XS Live Commands.
 *
 * @param platform
 * @param modFolderPath path to the mod folder relative to the user mods folder
 */
export function getCompatibleMaps(platform: PlatformUser, modFolderPath: string): Record<MapName, MapPath> {
    let mapPaths: Array<MapPath> = [];

    const commonPath = path.join(modsFolderPath(platform), ...modFolderPath.split("//"), "resources", "_common");

    const scenarioFolder = path.join(commonPath, "scenario");
    const rmsFolder = path.join(commonPath, "random-map-scripts");
    if (fs.existsSync(scenarioFolder)) {
        mapPaths.push(...recursiveReaddir(scenarioFolder, true));
    }
    if (fs.existsSync(rmsFolder)) {
        mapPaths.push(...recursiveReaddir(rmsFolder, true));
    }
    if (mapPaths.length === 0) {
        return {};
    }

    mapPaths = mapPaths.filter(filename => {
        const cmdFilename = filename.replace(/\.(?:aoe2scenario|rms2?)$/, ".commands.json");
        return cmdFilename !== filename && mapPaths.includes(cmdFilename);
    })
    const maps = {};
    for (const filePath of mapPaths) {
        maps[path.basename(filePath)] = filePath;
    }

    return maps;
}
