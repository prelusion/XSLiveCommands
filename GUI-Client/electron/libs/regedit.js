const {ipcMain} = require('electron');
const {promisified: regedit} = require('regedit');
const SteamID = require('steamid');

ipcMain.handle('regedit:getSteamId', async (_, url) => {
    const key = 'HKCU\\Software\\Valve\\Steam\\ActiveProcess';
    const listResult = await regedit.list([key]);
    const accountId = listResult[key]["values"]["ActiveUser"]["value"];

    return SteamID.fromIndividualAccountID(accountId).getSteamID64();
})
