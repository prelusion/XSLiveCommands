import SteamID from "steamid";
import Registry from "winreg";
import {promisify} from "util";

export async function getSteamId(): Promise<string | null> {
    const steamRegistryKey = new Registry({
        hive: Registry.HKCU,
        key: `\\Software\\Valve\\Steam\\ActiveProcess`,
    });

    let accountId = null;
    try {
        const get = promisify(steamRegistryKey.get.bind(steamRegistryKey))
        const steamRegistryItem = await get("ActiveUser");

        accountId = parseInt(steamRegistryItem.value, 16);
    } catch (_) {
        return null;
    }

    if (! accountId) {
        return null;
    }
    return SteamID.fromIndividualAccountID(accountId).getSteamID64();
}

export function getMicrosoftId() {
    throw new Error("Unimplemented");
    // todo
}

export const useWinNative = () => {
    return {getSteamId}
}
