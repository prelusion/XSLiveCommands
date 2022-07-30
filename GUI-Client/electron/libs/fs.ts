import {ipcMain} from "electron";
import fs, {readFileSync} from "fs";
import {CommandTemplates, JsonCommand, JsonCommandFile} from "../../src/interfaces/command";
import {CommandEvent} from "../../src/interfaces/general";

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

export async function readCommands(path: string): Promise<{commands?: CommandTemplates; reason?: string}> {
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

/**
 * File layout:
 *
 *      |                  | SIZE | CmlB   | TYPE   | DESCRIPTION             | ASSIGNMENT |
 *      |                  | ---- | ------ | ------ | ----------------------- | ---------- |
 *      | START            | >    |        |        |                         |            |
 *      |                  | 4    | 4      | int32  | Execution Cycle Number  |            |
 *      |                  | 4    | 8      | int32  | CommandId               |            |
 *      |                  | 4    | 12     | int32  | Parameter Count         | = N        |
 *      | REPEAT <N>       | >    |        |        |                         |            |
 *      |                  | 4    | 4      | int32  | Length of <name> string | = X        |
 *      |                  | x    | 4+X    | string | Name of the string      |            |
 *      |                  | 4    | 8+X    | int32  | Variable Type           | = T        |
 *      | IF (T == string) | >    |        |        |                         |            |
 *      |                  | 4    | 12+X   | int32  | Length of <name> string | = L        |
 *      |                  | L    | 12+X+L | string | Data                    |            |
 *      | ELSE             | >    |        |        |                         |            |
 *      |                  | 4    | 12+X   | I,B,F  | Data                    |            |
 *      | ENDIF            | >    |        |        |                         |            |
 *      | END REPEAT       | >    |        |        |                         |            |
 */
export function writeEvent(steamId: string, scenario: string, event: CommandEvent): void {
    const commandFilePath = profileFolderPath(steamId) + "command.xsdat";

    if (!event.params)
        event.params = [];

    const intSize = 4;
    const preParamIntCount = 3;  // Execution Cycle Number, CommandId, Parameter Count

    // Buffer gets the right amount of bytes allocated to it.
    const buffer = Buffer.alloc(intSize * preParamIntCount + event.params.length * intSize);

    let offset = 0;
    buffer.writeInt32LE(event.executeCycleNumber, offset);
    offset += intSize;
    buffer.writeInt32LE(event.commandId, offset);
    offset += intSize;
    buffer.writeInt32LE(event.params.length, offset);
    offset += intSize;

    for (const param of event.params) {
        buffer.writeInt32LE(param, offset);
        offset += intSize;
    }

    fs.writeFile(commandFilePath, buffer, (err) => {
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
