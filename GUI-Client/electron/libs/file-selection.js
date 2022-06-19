const {dialog, ipcMain} = require('electron');

const userProfile = process.env.USERPROFILE;

function buildResponse({filepath, reason} = {filepath: '', reason: ''}) {
    return {filepath, reason}
}

ipcMain.handle('fileControls:select', (_, steamId) => {
    const scenarioFolder = `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\resources\\_common\\scenario\\`;

    return new Promise((resolve) => {
        dialog
            .showOpenDialog({
                properties: ['openFile', 'dontAddToRecent'],
                defaultPath: scenarioFolder,
            })
            .then((response) => {
                if (response.filePaths.length === 1) {
                    resolve(buildResponse({filepath: response.filePaths[0]}));
                } else {
                    resolve(buildResponse({reason: response.canceled ? 'cancelled' : 'unknown'}));
                }
            })
            .catch(() => {
                resolve(buildResponse({reason: 'unknown'}));
            })
    });
});