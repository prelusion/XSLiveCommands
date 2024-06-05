import {ipcMain} from "electron";

export async function getSteamId(): Promise<string | null> {
    switch (process.platform) {
        case "win32": {
            const Win32 = await import("./native/win");
            return Win32.getSteamId();
        }
        case "linux": {
            const Linux = await import("./native/linux");
            return Linux.getSteamId();
        }
        case "darwin": /* mac */ {
            const MacOs = await import("./native/macos");
            return MacOs.getSteamId();
        }
        default: {
            throw new Error("Platform not supported :(");
        }
    }
}

ipcMain.handle("registry:getSteamId", async (): Promise<string | null> => {
    return getSteamId();
});
