import {ipcMain} from "electron";
import fs from "fs";
import path from "path";
import {clearInterval} from "timers";
import {CommandEvent, CommandTemplates, JsonCommand, JsonCommandFile, ParamType} from "../../shared/src/types/command";
import {Mod} from "../../shared/src/types/mods";
import {ensure} from "../../shared/src/util/general";
import {recursiveReaddir} from "../util/general";

// windows specific:
const userProfile = ensure(process.env.USERPROFILE);

function profileFolderPath(steamId: string): string {
    return path.join(userProfile, "Games", "Age of Empires 2 DE", steamId, "profile");
}

function modsFolderPath(steamId: string): string {
    return path.join(userProfile, "Games", "Age of Empires 2 DE", steamId, "mods");
}

export function deleteXsDataFiles(steamId: string, map: string): void {
    const profileFolder = profileFolderPath(steamId);

    for (const datfile of ["command.xsdat", `${map}.xsdat`]) {
        if (fs.existsSync(path.join(profileFolder, datfile))) {
            fs.unlinkSync(path.join(profileFolder, datfile));
        }
    }
}

export function readCycle(steamId: string, map: string): number | undefined {
    const profileFolder = profileFolderPath(steamId);

    try {
        const cycleFile = fs.readFileSync(path.join(profileFolder, `${map}.xsdat`), {flag: "a+", encoding: null});
        return Buffer.from(cycleFile).readInt32LE();
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ERROR and file doesn't have to exist.
    }
    return undefined;
}

export async function readCommands(path: string): Promise<{ commands?: CommandTemplates; reason?: string }> {
    if (!fs.existsSync(path))
        return {reason: 'no-json'};

    try {
        const commandsArray: JsonCommandFile = JSON.parse(fs.readFileSync(path).toString());

        const commands = commandsArray.reduce((
            commands: CommandTemplates,
            command: JsonCommand
        ) => {
            commands[command.name] = {
                funcName: command.funcName,
                params: command.params,
            };
            return commands;
        }, {});

        return {commands};
    } catch {
        return {reason: 'invalid-json'};
    }
}

/**
 * Reads the mods-status.json in the mods directory and returns a list of all installed mods
 * @param steamId
 */
export function readModsJson(steamId: string): Array<Mod> {
    const modsFolder = modsFolderPath(steamId);

    if (!fs.existsSync(modsFolder))
        return [];

    try {
        return (JSON.parse(fs.readFileSync(path.join(modsFolder, "mod-status.json")).toString()))["Mods"] ?? [];
    } catch {
        return [];
    }
}

/**
 * Gets the names of all the scenarios & RMS files in the mod folder specified that support XS Live Commands.
 *
 * @param steamId
 * @param modFolderPath path to the mod folder relative to the user mods folder
 */
export function getCompatibleMaps(steamId: string, modFolderPath: string): Record<string, string> {
    let filePaths: Array<string> = [];

    const scenarioFolder = path.join(
        modsFolderPath(steamId), ...modFolderPath.split("//"), "resources", "_common", "scenario"
    );
    if(fs.existsSync(scenarioFolder))
        filePaths.push(...recursiveReaddir(scenarioFolder, true));

    const rmsFolder = path.join(
        modsFolderPath(steamId), ...modFolderPath.split("//"), "resources", "_common", "random-map-scripts"
    );
    if(fs.existsSync(rmsFolder))
        filePaths.push(...recursiveReaddir(rmsFolder, true));

    if (filePaths.length === 0)
        return {};

    filePaths = filePaths.filter(
        filename => filename.match(/.(?:aoe2scenario|rms|rms2)$/)
                    && filePaths.includes(filename.replace(/.(?:aoe2scenario|rms|rms2)$/, ".json")),
    );
    const maps: Record<string, string> = {};
    for(const filePath of filePaths) {
        const mapName = filePath
            .replaceAll("\\", "/")
            .split("/")
            .splice(-1)[0];

        maps[mapName] = filePath;
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
 *      |                  | 4    | 4      | int32  | Execution Cycle Number      |            |
 *      |                  | 4    | 8      | int32  | Length of <funcName> string | = F        |
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
export function writeEvent(steamId: string, _: string, event: CommandEvent): void {
    const commandFilePath = path.join(profileFolderPath(steamId), "command.xsdat");

    if (!event.params)
        event.params = [];

    let bufferSize = 12 + event.funcName.length;
    for (let i = 0; i < event.params.length; i++) {
        const p = event.params[i];
        // Type & Value (or pre-string val if string)
        bufferSize += 8;
        // Param name (pre-string val + string)
        bufferSize += 4 + p.name.length;

        if (p.type === ParamType.STRING) {
            bufferSize += (p.data as string).length;
        }
    }

    const bufferInfo: BufferInfo = {
        buffer: Buffer.alloc(bufferSize),
        offset: 0
    }

    addIntToBuff(bufferInfo, event.executeCycleNumber, false);
    addStringToBuff(bufferInfo, event.funcName, false);
    addIntToBuff(bufferInfo, event.params.length, false);

    for (const param of event.params) {
        addStringToBuff(bufferInfo, param.name, false);

        switch (param.type) {
            case ParamType.INT:
                addIntToBuff(bufferInfo, param.data as number);
                break;
            case ParamType.FLOAT:
                addFloatToBuff(bufferInfo, param.data as number);
                break;
            case ParamType.BOOL:
                addBoolToBuff(bufferInfo, param.data as boolean);
                break;
            case ParamType.STRING:
                addStringToBuff(bufferInfo, param.data as string);
                break;
        }
    }

    const interval = setInterval(() => {
        fs.writeFile(commandFilePath, bufferInfo.buffer, (err) => {
            if (!err) {
                // Convert to interval primitive
                const intervalId = interval[Symbol.toPrimitive]();
                clearInterval(intervalId);
            }
        });
    }, 1);
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions
 *  ======================================================================================*/

ipcMain.handle("fs:deleteXsDataFiles", (_, steamId: string, map: string) => {
    return deleteXsDataFiles(steamId, map);
});

ipcMain.handle("fs:readCycle", (_, steamId: string, map: string) => {
    return readCycle(steamId, map);
});

ipcMain.handle("fs:readCommands", (_, path: string) => {
    return readCommands(path);
});

ipcMain.handle("fs:writeEvent", (_, steamId: string, map: string, event: CommandEvent) => {
    return writeEvent(steamId, map, event);
});

ipcMain.handle("fs:readModsJson", (_, steamId: string) => {
    return readModsJson(steamId);
});

ipcMain.handle("fs:getCompatibleMaps", (_, steamId: string, modFolderPath: string) => {
    return getCompatibleMaps(steamId, modFolderPath);
});

ipcMain.handle("fs:exists", (_, absolutePath: string) => {
    return exists(absolutePath);
});
