import {ipcMain} from "electron";
import {win} from "../main";

export function resize(width: number, height: number): void {
    win && win.setSize(width, height);
}

export function getEnvVar(str: string): string | undefined {
    return process.env[str];
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
