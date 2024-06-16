import {clipboard, ipcMain} from "electron";


export async function write(text: string): Promise<void> {
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
