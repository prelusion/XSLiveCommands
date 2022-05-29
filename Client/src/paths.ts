import {promisified as regedit} from "regedit";
import SteamID from "steamid";

const userProfile = process.env.USERPROFILE;
const afterProfileFolder = "Games\\Age of Empires 2 DE";
const afterSteamID = "profile";
export let PATH_WRITE_TO = "";
export let PATH_READ_FROM = "";

export async function initPaths() {
    const key = 'HKCU\\Software\\Valve\\Steam\\ActiveProcess';
    const listResult = await regedit.list([key])
    let accountId = listResult[key]["values"]["ActiveUser"]["value"]
    let steamID = SteamID.fromIndividualAccountID(accountId).getSteamID64();

    PATH_WRITE_TO = `${userProfile}\\${afterProfileFolder}\\${steamID}\\${afterSteamID}\\command.xsdat`
    PATH_READ_FROM = `${userProfile}\\${afterProfileFolder}\\${steamID}\\${afterSteamID}\\default0.xsdat`
}
