import {ipcMain} from "electron";
import {useWinNative} from "@main/libs/native/win";
import {useMacOsNative} from "@main/libs/native/macos";
import {useLinuxNative} from "@main/libs/native/linux";

export async function getNativeSteamId(): Promise<string | null> {
    switch (process.platform) {
        case "win32": {
            const {getSteamId} = useWinNative();

            return getSteamId();
        }
        case "linux": {
            const {getSteamId} = useLinuxNative();

            return getSteamId();
        }
        case "darwin": /* mac */
        {
            const {getSteamId} = useMacOsNative();

            return getSteamId();
        }
        default: {
            throw new Error("Platform not supported :(");
        }
    }
}

export const useNativeFunctions = () => {
    const nativeIpc = () => {
        ipcMain.handle("registry:getSteamId", async (): Promise<string | null> => {
            return getNativeSteamId();
        });
    }

    return {nativeIpc};
}
