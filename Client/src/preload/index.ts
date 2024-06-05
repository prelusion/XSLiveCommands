import {contextBridge, ipcRenderer} from "electron";
import {ConfigFileCoreFormat} from "../shared/src/types/config";
import {ScheduledCommand} from "../shared/src/types/commands/scheduled";
import {PlatformUser} from "../shared/src/types/user";

// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.

// !!! REMEMBER !!!
// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'

contextBridge.exposeInMainWorld('registry', {
    getSteamId: () => ipcRenderer.invoke('registry:getSteamId'),
});

contextBridge.exposeInMainWorld('fs', {
    deleteXsDataFiles: (platform: PlatformUser, map: string) => ipcRenderer.invoke('fs:deleteXsDataFiles', platform, map),
    readTick: (platform: PlatformUser, map: string) => ipcRenderer.invoke('fs:readTick', platform, map),
    readCommands: (path: string) => ipcRenderer.invoke('fs:readCommands', path),
    writeCommand: (platform: PlatformUser, map: string, event: ScheduledCommand) => ipcRenderer.invoke('fs:writeCommand', platform, map, event),
    readModsJson: (platform: PlatformUser) => ipcRenderer.invoke('fs:readModsJson', platform),
    getCompatibleMaps: (platform: PlatformUser, modFolderPath: string) => ipcRenderer.invoke('fs:getCompatibleMaps', platform, modFolderPath),
    exists: (absolutePath: string) => ipcRenderer.invoke('fs:exists', absolutePath),
});

contextBridge.exposeInMainWorld('clipboard', {
    write: (text: string) => ipcRenderer.invoke('clipboard:write', text),
});

contextBridge.exposeInMainWorld('manager', {
    resize: (width: number, height: number) => ipcRenderer.invoke('manager:resize', width, height),
    getEnvVar: (str: string) => ipcRenderer.invoke('manager:getEnvVar', str),
    restart: () => ipcRenderer.invoke('manager:restart'),
    exit: () => ipcRenderer.invoke('manager:exit'),
});

contextBridge.exposeInMainWorld('config', {
    readConfig: (version: number) => ipcRenderer.invoke('config:readConfig', version),
    writeConfig: (config: ConfigFileCoreFormat, version: number) => ipcRenderer.invoke('config:writeConfig', config, version),
    resetConfig: (version: number | null = null) => ipcRenderer.invoke('config:resetConfig', version),
});
