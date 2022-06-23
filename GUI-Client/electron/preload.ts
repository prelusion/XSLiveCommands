import {contextBridge, ipcRenderer} from "electron";
import {CommandEvent} from "../src/interfaces/general";

// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.

// !!! REMEMBER !!!
// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'

contextBridge.exposeInMainWorld('regedit', {
    getSteamId: () => ipcRenderer.invoke('regedit:getSteamId'),
});

contextBridge.exposeInMainWorld('dialog', {
    select: (steamId: string) => ipcRenderer.invoke('dialog:select', steamId),
});

contextBridge.exposeInMainWorld('fs', {
    deleteXsDataFiles: (steamId: string, scenario: string) => ipcRenderer.invoke('fs:deleteXsDataFiles', steamId, scenario),
    readCycle: (steamId: string, scenario: string) => ipcRenderer.invoke('fs:readCycle', steamId, scenario),
    writeEvent: (steamId: string, scenario: string, event: CommandEvent) => ipcRenderer.invoke('fs:readCycle', steamId, scenario, event),
})

contextBridge.exposeInMainWorld('clipboard', {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text),
});
