const {ipcMain} = require('electron');
const fs = require('fs');
const {readFileSync} = require("fs");

const userProfile = process.env.USERPROFILE;

const profileFolderPath = (steamId) => `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\profile\\`;

ipcMain.handle('fs:deleteXsDataFiles', (_, steamId, scenario) => {
    const profileFolder = profileFolderPath(steamId);

    for (let path of ['command.xsdat', `${scenario}.xsdat`]) {
        if (fs.existsSync(profileFolder + path)) {
            fs.unlinkSync(profileFolder + path);
        }
    }
});

ipcMain.handle('fs:readCycle', (_, steamId, scenario) => {
    const profileFolder = profileFolderPath(steamId);

    try {
        const cycleFile = readFileSync(`${profileFolder}${scenario}.xsdat`, { flag: 'a+', encoding: null});
        return Buffer.from(cycleFile).readInt32LE();
    } catch (err) {
        // File doesn't exist. Ignored because of HUGE ERROR and file doesn't have to exist.
    }
    return undefined;
});

ipcMain.handle('fs:writeEvent', (_, steamId, scenario, event) => {
    const dataFilePath = profileFolderPath(steamId) + 'command.xsdat';

    if (!event.params)
        event.params = [];

    // File layout (all int32):
    // 1:       Execution Cycle Number
    // 2:       CommandId
    // 3:       Parameter Count
    // 4+:      Parameters
    const int_size = 4;
    const preParamIntCount = 3;  // Execution Cycle Number, CommandId, Parameter Count

    // Buffer gets the right amount of bytes allocated to it.
    const buffer = Buffer.alloc(int_size * preParamIntCount + event.params.length * int_size);

    let offset = 0;
    buffer.writeInt32LE(event.executeCycleNumber, offset);
    offset += int_size;
    buffer.writeInt32LE(event.commandId, offset);
    offset += int_size;
    buffer.writeInt32LE(event.params.length, offset);
    offset += int_size;

    for (const param of event.params) {
        buffer.writeInt32LE(param, offset);
        offset += int_size;
    }

    fs.writeFile(dataFilePath, buffer, (err) => {
        if (err) throw new Error("Writing to file didn't work");
    });
});
