import {ipcMain} from "electron";
import SteamID from "steamid";

// Not entirely sure why, but converting this to `import req from 'native-req'` doesn't work.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reg = require('native-reg');

export async function getSteamId(): Promise<string | null> {
    const stringKey = "Software\\Valve\\Steam\\ActiveProcess";
    const key = reg.openKey(reg.HKCU, stringKey, reg.Access.READ);

    if (!key)
        return null;

    const accountId = reg.getValue(key, 'ActiveUser', 'value');
    return SteamID.fromIndividualAccountID(accountId as string).getSteamID64();
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions                      
 *  ======================================================================================*/

ipcMain.handle("regedit:getSteamId", (): Promise<string | null> => {
    return getSteamId();
});
