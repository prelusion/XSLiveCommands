import {ipcMain} from "electron";
import fs from "fs";
import path from "path";
import {Mod} from "../../shared/src/types/mods";
import {PlatformUser} from "../../shared/src/types/user";
import {ensure} from "../../shared/src/util/general";
import {recursiveReaddir} from "../util/general";
import {CommandFile, MapCommands, MapName, MapPath, ParamStruct} from "../../shared/src/types/commands/structs";
import {ParamType, ScheduledCommand} from "../../shared/src/types/commands/scheduled";
import {clearInterval} from "timers";

// windows specific:
const userProfile = ensure(process.env.USERPROFILE);

function profileFolderPath(platform: PlatformUser): string {
    if(platform.type === "steam") {
        return path.join(userProfile, "Games", "Age of Empires 2 DE", platform.userId, "profile");
    } else {
        // todo: MS Store
        return "";
    }
}

function modsFolderPath(platform: PlatformUser): string {
    if(platform.type === "steam") {
        return path.join(userProfile, "Games", "Age of Empires 2 DE", platform.userId, "mods");
    } else {
        // todo: MS Store
        return "";
    }
}

export function deleteXsDataFiles(platform: PlatformUser, map: string): void {
    const profileFolder = profileFolderPath(platform);

    const cmdsDatFilePath = path.join(profileFolder, "xslc.commands.xsdat");
    const mapDatFilePath = path.join(profileFolder, `${map}.xsdat`);

    if (fs.existsSync(cmdsDatFilePath)) {
        fs.unlinkSync(cmdsDatFilePath);
    }

    if(!fs.existsSync(mapDatFilePath)) {
        return;
    }

    const bufferInfo: BufferInfo = {
        buffer: Buffer.alloc(4),
        offset: 0
    }
    addIntToBuff(bufferInfo, -1, false);

    let interval = setInterval(() => {
        let file: number | null = null;
        try {
            file = fs.openSync(mapDatFilePath, 'w');
            fs.writeSync(file, bufferInfo.buffer, 0, 4, 0);
        } catch {
            return;
        } finally { if(file) {
            fs.closeSync(file);
        }}
        clearInterval(interval);
    });
}

export function readCycle(platform: PlatformUser, map: string): number | undefined {
    const profileFolder = profileFolderPath(platform);

    try {
        const cycleFile = fs.readFileSync(path.join(profileFolder, `${map}.xsdat`), {flag: "a+", encoding: null});
        return Buffer.from(cycleFile).readInt32LE();
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ERROR and file doesn't have to exist.
    }
    return undefined;
}

function areValidParameters(params?: Array<ParamStruct>): boolean {
    if(!params) {
        return false;
    }

    for(let param of params) {
        if(!param.name) {
            return false;
        }
        if(!param.default) {
            continue;
        }
        switch (param.type) {
            case "int":
            case "float":  if (typeof param.default !== "number") return false; break;
            case "bool":   if (typeof param.default !== "boolean") return false; break;
            case "string": if (typeof param.default !== "string") return false; break;
        }
    }
    return true;
}

export async function readCommands(path: string): Promise<{ commands?: MapCommands; reason?: string }> {
    if (!fs.existsSync(path)) {
        return {reason: 'no-json'};
    }

    try {
        const commandsArray: CommandFile = JSON.parse(fs.readFileSync(path).toString());
        const commands: MapCommands = {};
        for(let command of commandsArray) {
            if(!command.name || !command.function || !areValidParameters(command.params)) {
                return {reason: 'invalid-json'};
            }
            commands[command.name] = command;
        }

        return {commands: commands};
    } catch {
        return {reason: 'invalid-json'};
    }
}

/**
 * Reads the mods-status.json in the mods directory and returns a list of all installed mods
 * @param platform
 */
export function readModsJson(platform: PlatformUser): Array<Mod> {
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

export function exists(absolutePath: string): boolean {
    return fs.existsSync(absolutePath);
}

/**
 * Convert the buffer to hexadecimal, so it's easier to debug
 *
 * @param buffer
 */
// function buf2hex(buffer: Buffer): string {
//     return [...new Uint8Array(buffer)]
//         .map(x => (x as number).toString(16).padStart(2, "0"))
//         .join("");
// }

type BufferInfo = { buffer: Buffer; offset: 0 };

function addTypeToBuff(bufferInfo: BufferInfo, type: ParamType): void {
    bufferInfo.buffer.writeInt32LE(type, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addIntToBuff(bufferInfo: BufferInfo, int: number, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.INT);
    bufferInfo.buffer.writeInt32LE(int, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addBoolToBuff(bufferInfo: BufferInfo, bool: boolean, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.BOOL);
    bufferInfo.buffer.writeInt32LE(bool ? 1 : 0, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addFloatToBuff(bufferInfo: BufferInfo, float: number, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.FLOAT);
    bufferInfo.buffer.writeFloatLE(float, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addStringToBuff(bufferInfo: BufferInfo, str: string, addType = true): void {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.STRING);
    bufferInfo.buffer.writeInt32LE(str.length, bufferInfo.offset);
    bufferInfo.offset += 4;
    bufferInfo.buffer.write(str, bufferInfo.offset, 'utf8');
    bufferInfo.offset += str.length;
}

/**
 * File layout:
 *
 *      |                  | SIZE | CmlB   | TYPE   | DESCRIPTION                 | ASSIGNMENT |
 *      |                  | ---- | ------ | ------ | --------------------------- | ---------- |
 *      | START            | >    |        |        |                             |            |
 *      |                  | 4    | 4      | int32  | Execution Tick              |            |
 *      |                  | 4    | 8      | int32  | Length of <function> string | = F        |
 *      |                  | F    | 8+F    | string | Name of the function        |            |
 *      |                  | 4    | 12+F   | int32  | Parameter Count             | = N        |
 *      | REPEAT <N>       | >    |        |        |                             |            |
 *      |                  | 4    | 4      | int32  | Length of <name> param      | = X        |
 *      |                  | X    | 4+X    | string | Name of the param           |            |
 *      |                  | 4    | 8+X    | int32  | Variable Type               | = T        |
 *      | IF (T == string) | >    |        |        |                             |            |
 *      |                  | 4    | 12+X   | int32  | Length of <name> string     | = L        |
 *      |                  | L    | 12+X+L | string | Data                        |            |
 *      | ELSE             | >    |        |        |                             |            |
 *      |                  | 4    | 12+X   | I,B,F  | Data                        |            |
 *      | ENDIF            | >    |        |        |                             |            |
 *      | END REPEAT       | >    |        |        |                             |            |
 */
export function writeEvent(platform: PlatformUser, _: string, scheduledCommand: ScheduledCommand): void {
    const commandFilePath = path.join(profileFolderPath(platform), "xslc.commands.xsdat");

    if (!scheduledCommand.params)
        scheduledCommand.params = [];

    let bufferSize = 12 + scheduledCommand.function.length;
    for (const param of scheduledCommand.params) {
        // Type & Value (or pre-string val if string)
        bufferSize += 8;
        // Param name (pre-string val + string)
        bufferSize += 4 + param.name.length;

        if (param.type === ParamType.STRING) {
            bufferSize += (param.value as string).length;
        }
    }

    const bufferInfo: BufferInfo = {
        buffer: Buffer.alloc(bufferSize),
        offset: 0
    }

    addIntToBuff(bufferInfo, scheduledCommand.execTick, false);
    addStringToBuff(bufferInfo, scheduledCommand.function, false);
    addIntToBuff(bufferInfo, scheduledCommand.params.length, false);

    for (const param of scheduledCommand.params) {
        addStringToBuff(bufferInfo, param.name, false);

        switch (param.type) {
            case ParamType.INT:    addIntToBuff(bufferInfo, param.value); break;
            case ParamType.FLOAT:  addFloatToBuff(bufferInfo, param.value); break;
            case ParamType.BOOL:   addBoolToBuff(bufferInfo, param.value); break;
            case ParamType.STRING: addStringToBuff(bufferInfo, param.value); break;
        }
    }

    console.log(commandFilePath);
    let interval = setInterval(() => {
        try {
            fs.writeFileSync(commandFilePath, bufferInfo.buffer);
        } catch {
            return;
        }
        clearInterval(interval);
    });
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions
 *  ======================================================================================*/

ipcMain.handle("fs:deleteXsDataFiles", (_, platform: PlatformUser, map: string) => {
    return deleteXsDataFiles(platform, map);
});

ipcMain.handle("fs:readCycle", (_, platform: PlatformUser, map: string) => {
    return readCycle(platform, map);
});

ipcMain.handle("fs:readCommands", (_, path: string) => {
    return readCommands(path);
});

ipcMain.handle("fs:writeEvent", (_, platform: PlatformUser, map: string, scheduledCommand: ScheduledCommand) => {
    return writeEvent(platform, map, scheduledCommand);
});

ipcMain.handle("fs:readModsJson", (_, platform: PlatformUser) => {
    return readModsJson(platform);
});

ipcMain.handle("fs:getCompatibleMaps", (_, platform: PlatformUser, modFolderPath: string) => {
    return getCompatibleMaps(platform, modFolderPath);
});

ipcMain.handle("fs:exists", (_, absolutePath: string) => {
    return exists(absolutePath);
});
