import {CommandStruct} from "../../src/interfaces/command";
import {CommandEvent} from "../../src/interfaces/general";
import {ipcMain} from "electron";
import fs, {readFileSync} from "fs";

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

export function readCommands(path: string): Array<CommandStruct> | undefined {
    if(fs.existsSync(path))
        return JSON.parse(readFileSync(path).toString()) as Array<CommandStruct>;

    return undefined;
}

function buf2hex(buffer: Buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

export function writeEvent(steamId: string, scenario: string, event: CommandEvent): void {
    const commandFilePath = profileFolderPath(steamId) + "command.xsdat";

    console.log("WRITE EVENT")
    console.log(steamId, scenario)

    if (!event.params)
        event.params = [];

    console.log(event)

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

    console.log(buf2hex(buffer));

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
