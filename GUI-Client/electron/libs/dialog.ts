import {dialog, ipcMain} from "electron";

// windows specific:
export const userProfile = process.env.USERPROFILE;

export interface SteamIdResponse {
    filepath?: string;
    reason?: string;
}

export function buildResponse({filepath, reason}: SteamIdResponse = {filepath: "", reason: ""}): SteamIdResponse {
    return {filepath, reason};
}

export async function select(steamId: string): Promise<SteamIdResponse> {
    const scenarioFolder = `${userProfile}\\Games\\Age of Empires 2 DE\\${steamId}\\resources\\_common\\scenario\\`;

    try {
        const response = await dialog.showOpenDialog({
            properties: [
                "openFile",
                "dontAddToRecent"
            ],
            filters: [
                { name: 'Scenario Files', extensions: ['aoe2scenario'] }
            ],
            defaultPath: scenarioFolder,
        });

        if (response.filePaths.length === 1) {
            return buildResponse({filepath: response.filePaths[0]});
        } else {
            return buildResponse({reason: response.canceled ? "cancelled" : "unknown"});
        }
    } catch {
        return buildResponse({reason: "unknown"});
    }
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions                      
 *  ======================================================================================*/

ipcMain.handle("dialog:select", (_, steamId: string) => {
    return select(steamId);
});