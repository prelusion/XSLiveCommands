import {ipcMain} from "electron";
import SteamID from "steamid";

// Not entirely sure why, but converting this to `import req from 'native-req'` doesn't work.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const reg = require('native-reg');

// // Window module doesn't have type definitions. This is simple typing for all that we need.
// const Windows: {
//     registry: (regexKey: string) => { 'ActiveUser': { 'value': string } };
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// } = require("windows");

export async function getSteamId(): Promise<string | null> {
    console.log(reg)
    // const key = "HKCU\\Software\\Valve\\Steam\\ActiveProcess";
    // const keySet = Windows.registry(stringKey);
    // const accountId = keySet["ActiveUser"]["value"];

    const stringKey = "Software\\Valve\\Steam\\ActiveProcess";
    const key = reg.openKey(reg.HKCU, stringKey, reg.Access.READ);

    console.log(key)
    if (!key)
        return null;

    const accountId = reg.getValue(key, 'ActiveUser', 'value');

    console.log(accountId)
    return SteamID.fromIndividualAccountID(accountId as string).getSteamID64();
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions                      
 *  ======================================================================================*/

ipcMain.handle("regedit:getSteamId", (): Promise<string | null> => {
    return getSteamId();
});
