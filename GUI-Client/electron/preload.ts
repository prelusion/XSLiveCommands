import {contextBridge, ipcRenderer} from "electron";
import {CommandEvent} from "../src/interfaces/command";
import {ConfigFileCoreFormat} from "../src/interfaces/config";

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
    deleteXsDataFiles: (steamId: string, map: string) => ipcRenderer.invoke('fs:deleteXsDataFiles', steamId, map),
    readCycle: (steamId: string, map: string) => ipcRenderer.invoke('fs:readCycle', steamId, map),
    readCommands: (path: string) => ipcRenderer.invoke('fs:readCommands', path),
    writeEvent: (steamId: string, map: string, event: CommandEvent) => ipcRenderer.invoke('fs:writeEvent', steamId, map, event),
    readModsJson: (steamId: string) => ipcRenderer.invoke('fs:readModsJson', steamId),
    getCompatibleMaps: (steamId: string, modFolderPath: string) => ipcRenderer.invoke('fs:getCompatibleMaps', steamId, modFolderPath),
    exists: (absolutePath: string) => ipcRenderer.invoke('fs:exists', absolutePath),
});

contextBridge.exposeInMainWorld('clipboard', {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text),
});

contextBridge.exposeInMainWorld('manager', {
    resize: (width: number, height: number) => ipcRenderer.invoke('manager:resize', width, height),
    getEnvVar: (str: string) => ipcRenderer.invoke('manager:getEnvVar', str),
});

contextBridge.exposeInMainWorld('config', {
    readConfig: (version: number) => ipcRenderer.invoke('config:readConfig', version),
    writeConfig: (config: ConfigFileCoreFormat, version: number) => ipcRenderer.invoke('config:writeConfig', config, version),
    resetConfig: (version: number) => ipcRenderer.invoke('config:resetConfig', version),
});
