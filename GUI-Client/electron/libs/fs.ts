import {ipcMain} from "electron";
import fs, {readFileSync} from "fs";
import {Commands, JsonCommand} from "../../src/interfaces/command";
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

export async function readCommands(path: string): Promise<{commands?: Commands; reason?: string}> {
    if (!fs.existsSync(path))
        return {reason: 'no-json'};

    try {
        const commandsArray: Array<JsonCommand> = JSON.parse(readFileSync(path).toString());

        const commands = commandsArray.reduce((
            commands: Commands,
            command: {name: string; id: number; params: number[]}
        ) => {
            commands[command.name] = {id: command.id, params: command.params};
            return commands;
        }, {});

        return {commands};
    } catch {
        return {reason: 'invalid-json'};
    }
}

function buf2hex(buffer: Buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}

export function writeEvent(steamId: string, scenario: string, event: CommandEvent): void {
    const commandFilePath = profileFolderPath(steamId) + "command.xsdat";

    if (!event.params)
        event.params = [];

    // File layout (all int32):
    // 1:       Execution Cycle Number
    // 2:       CommandId
    // 3:       Parameter Count
    // 4+:      Parameters
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
