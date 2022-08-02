import {ipcMain} from "electron";
import fs, {readFileSync} from "fs";
import {CommandEvent, CommandTemplates, JsonCommand, JsonCommandFile, ParamType} from "../../src/interfaces/command";

const userProfile = process.env.USERPROFILE;

export function profileFolderPath(steamId: string): string {
    return `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\profile\\`;
}

export function deleteXsDataFiles(steamId: string, scenario: string): void {
    const profileFolder = profileFolderPath(steamId);

    for (const path of ["command.xsdat", `${scenario}.xsdat`]) {
        if (fs.existsSync(profileFolder + path)) {
            fs.unlinkSync(profileFolder + path);
        }
    }
}

export function readCycle(steamId: string, scenario: string): number | undefined {
    const profileFolder = profileFolderPath(steamId);

    try {
        const cycleFile = readFileSync(`${profileFolder}${scenario}.xsdat`, {flag: "a+", encoding: null});
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
        const commandsArray: JsonCommandFile = JSON.parse(readFileSync(path).toString());

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
 * Convert the buffer to hexadecimal so it's easier to debug
 *
 * @param buffer
 */
function buf2hex(buffer: Buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}

type BufferInfo = { buffer: Buffer; offset: 0 };

function addTypeToBuff(bufferInfo: BufferInfo, type: ParamType) {
    bufferInfo.buffer.writeInt32LE(type, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addIntToBuff(bufferInfo: BufferInfo, int: number, addType = true) {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.INT);
    bufferInfo.buffer.writeInt32LE(int, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addBoolToBuff(bufferInfo: BufferInfo, bool: boolean, addType = true) {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.BOOL);
    bufferInfo.buffer.writeInt32LE(bool ? 1 : 0, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addFloatToBuff(bufferInfo: BufferInfo, float: number, addType = true) {
    if (addType)
        addTypeToBuff(bufferInfo, ParamType.FLOAT);
    bufferInfo.buffer.writeFloatLE(float, bufferInfo.offset);
    bufferInfo.offset += 4;
}

function addStringToBuff(bufferInfo: BufferInfo, str: string, addType = true) {
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
export function writeEvent(steamId: string, scenario: string, event: CommandEvent): void {
    const commandFilePath = profileFolderPath(steamId) + "command.xsdat";

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

    // console.log(buf2hex(bufferInfo.buffer));

    fs.writeFile(commandFilePath, bufferInfo.buffer, (err) => {
        if (err) throw new Error("Writing to file didn't work");
    });
}

// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================

ipcMain.handle("fs:deleteXsDataFiles", (_, steamId: string, scenario: string) => {
    return deleteXsDataFiles(steamId, scenario);
});

ipcMain.handle("fs:readCycle", (_, steamId: string, scenario: string) => {
    return readCycle(steamId, scenario);
});

ipcMain.handle("fs:readCommands", (_, path: string) => {
    return readCommands(path);
});

ipcMain.handle("fs:writeEvent", (_, steamId: string, scenario: string, event: CommandEvent) => {
    return writeEvent(steamId, scenario, event);
});
