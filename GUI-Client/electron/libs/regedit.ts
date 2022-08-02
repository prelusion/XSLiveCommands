import {ipcMain} from "electron";
import SteamID from "steamid";

// Window module doesn't have type definitions. This is simple typing for all that we need.
const Windows: {
    registry: (regexKey: string) => { 'ActiveUser': { 'value': string } };
// eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("windows");

export async function getSteamId(): Promise<string> {
    const key = "HKCU\\Software\\Valve\\Steam\\ActiveProcess";
    const keySet = Windows.registry(key);
    const accountId = keySet["ActiveUser"]["value"];

    return SteamID.fromIndividualAccountID(accountId as string).getSteamID64();
}

// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================

ipcMain.handle("regedit:getSteamId", () => {
    return getSteamId();
});
