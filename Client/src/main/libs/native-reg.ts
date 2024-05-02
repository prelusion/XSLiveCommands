import {ipcMain} from "electron";
import SteamID from "steamid";
import * as Registry from 'native-reg';
import {Access} from "native-reg";

export function getSteamId(): string | null {
    const regKey = `Software\\Valve\\Steam\\ActiveProcess\\`;
    const key = Registry.openKey(Registry.HKCU, regKey, Access.READ);

    if (!key) {
        Registry.closeKey(key);
        return null;
    }

    const accountId = Registry.getValue(key, null, 'ActiveUser');
    Registry.closeKey(key);

    if (!accountId) {
        return null;
    }

    return SteamID.fromIndividualAccountID(accountId.toString()).getSteamID64();
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions                      
 *  ======================================================================================*/

ipcMain.handle("registry:getSteamId", (): string | null => {
    return getSteamId();
});
