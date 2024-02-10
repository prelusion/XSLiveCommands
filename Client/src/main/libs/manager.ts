import {app, ipcMain} from "electron";
import {win} from "../index";

export function resize(width: number, height: number): void {
    win && win.setSize(width, height);
}

export function getEnvVar(str: string): string | undefined {
    return process.env[str];
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

ipcMain.handle('manager:resize', (_, width: number, height: number): void => {
    resize(width, height);
});

ipcMain.handle('manager:getEnvVar', (_, str: string): string | undefined => {
    return getEnvVar(str);
});

ipcMain.handle('manager:restart', () => restart());
ipcMain.handle('manager:exit', () => exit());
