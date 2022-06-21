import {ipcMain} from "electron";
import {promisified as regedit} from "regedit";
import SteamID from "steamid";

export async function getSteamId(): Promise<string> {
    const key = "HKCU\\Software\\Valve\\Steam\\ActiveProcess";
    const listResult = await regedit.list([key]);
    const accountId = listResult[key]["values"]["ActiveUser"]["value"];

    return SteamID.fromIndividualAccountID(accountId as string).getSteamID64();
}

// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================

ipcMain.handle("regedit:getSteamId", () => {
    return getSteamId();
});
