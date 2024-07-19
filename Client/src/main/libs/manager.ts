import {app, BrowserWindow, ipcMain} from "electron";

/* Dummy function to represent window */
export async function resize(width: number, height: number): Promise<void> {
    // ...
}

export async function _resize(window: BrowserWindow, width: number, height: number): Promise<void> {
    window && window.setSize(width, height);
}

export async function getEnvVar(str: string): Promise<string | undefined> {
    return process.env[str] ?? undefined;
}

export function restart(): void {
    app.relaunch();
    app.exit();
}

export function exit(): void {
    app.exit();
}


/** ========================================================================================
 *                        Handlers for wrapping the above functions
 *  ======================================================================================*/



export const useApplicationFunctions = () => {
    const applicationIpc = (window: BrowserWindow) => {
        ipcMain.handle('manager:resize', async (_, width: number, height: number): Promise<void> => {
            return _resize(window, width, height);
        });

        ipcMain.handle('manager:getEnvVar', async (_, str: string): Promise<string | undefined> => {
            return getEnvVar(str);
        });

        ipcMain.handle('manager:restart', async () => restart());
        ipcMain.handle('manager:exit', async () => exit());
    }

    return {applicationIpc};
}
