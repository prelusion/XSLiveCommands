import {ipcMain} from "electron";
import {win} from "../main";

export function resize(width: number, height: number): void {
    win && win.setSize(width, height);
}

// =========================================================================================
// ======================= Handlers for wrapping the above functions =======================
// =========================================================================================

ipcMain.handle('manager:resize', (_, width: number, height: number): void => {
    resize(width, height);
});
