"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEvent = exports.readCommands = exports.readCycle = exports.deleteXsDataFiles = exports.profileFolderPath = void 0;
const tslib_1 = require("tslib");
const electron_1 = require("electron");
const fs_1 = tslib_1.__importStar(require("fs"));
const userProfile = process.env.USERPROFILE;
function profileFolderPath(steamId) {
    return `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\profile\\`;
}
exports.profileFolderPath = profileFolderPath;
function deleteXsDataFiles(steamId, scenario) {
    const profileFolder = profileFolderPath(steamId);
    for (const path of ["command.xsdat", `${scenario}.xsdat`]) {
        if (fs_1.default.existsSync(profileFolder + path)) {
            fs_1.default.unlinkSync(profileFolder + path);
        }
    }
}
exports.deleteXsDataFiles = deleteXsDataFiles;
function readCycle(steamId, scenario) {
    const profileFolder = profileFolderPath(steamId);
    try {
        const cycleFile = (0, fs_1.readFileSync)(`${profileFolder}${scenario}.xsdat`, { flag: "a+", encoding: null });
        return Buffer.from(cycleFile).readInt32LE();
    }
    catch (err) {
        // File doesn't exist. Ignored because of HUGE ERROR and file doesn't have to exist.
    }
    return undefined;
}
exports.readCycle = readCycle;
function readCommands(path) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(path))
            return { reason: 'no-json' };
        try {
            const commandsArray = JSON.parse((0, fs_1.readFileSync)(path).toString());
            const commands = commandsArray.reduce((commands, command) => {
                commands[command.name] = {
                    funcName: command.funcName,
                    params: command.params,
                };
                return commands;
            }, {});
            return { commands };
        }
        catch (_a) {
            return { reason: 'invalid-json' };
        }
    });
}
exports.readCommands = readCommands;
/**
 * Convert the buffer to hexadecimal so it's easier to debug
 *
 * @param buffer
 */
function buf2hex(buffer) {
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
function writeEvent(steamId, scenario, event) {
    const commandFilePath = profileFolderPath(steamId) + "command.xsdat";
    if (!event.params)
        event.params = [];
    const intSize = 4;
    const preParamIntCount = 3; // Execution Cycle Number, CommandId, Parameter Count
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
    fs_1.default.writeFile(commandFilePath, buffer, (err) => {
        if (err)
            throw new Error("Writing to file didn't work");
    });
}
exports.writeEvent = writeEvent;
// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================
electron_1.ipcMain.handle("fs:deleteXsDataFiles", (_, steamId, scenario) => {
    return deleteXsDataFiles(steamId, scenario);
});
electron_1.ipcMain.handle("fs:readCycle", (_, steamId, scenario) => {
    return readCycle(steamId, scenario);
});
electron_1.ipcMain.handle("fs:readCommands", (_, path) => {
    return readCommands(path);
});
electron_1.ipcMain.handle("fs:writeEvent", (_, steamId, scenario, event) => {
    return writeEvent(steamId, scenario, event);
});
//# sourceMappingURL=fs.js.map