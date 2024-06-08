import {clipboard, ipcMain} from "electron";


export function write(text: string): void {
    clipboard.writeText(text);
}

/** ========================================================================================
 *                        Handlers for wrapping the above functions
 *  ======================================================================================*/

export const useClipboardFunctions = () => {
    const clipboardIpc = () => {
        ipcMain.handle('clipboard:write', (_, text: string): void => {
            write(text);
        });
    }
    return {clipboardIpc};
}
