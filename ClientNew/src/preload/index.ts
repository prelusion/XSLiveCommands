import {contextBridge, ipcRenderer, IpcRendererEvent, shell} from "electron"
import {arch, platform, release} from 'os'
import {PlatformUser} from "../shared/src/types/user";
import {ScheduledCommand} from "../shared/src/types/commands/scheduled";
import {ConfigCoreStruct} from "../shared/src/types/config";

contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel: string, args?: any) => ipcRenderer.send(channel, args),
    sendSync: (channel: string, args?: any) => ipcRenderer.sendSync(channel, args),
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.once(channel, listener),
    invoke: (channel: string, args: any) => ipcRenderer.invoke(channel, args),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
});

contextBridge.exposeInMainWorld("systemInfo", {
    platform: platform(),
    release: release(),
    arch: arch()
})

contextBridge.exposeInMainWorld("shell", shell)

contextBridge.exposeInMainWorld("crash", {
    start: () => {
        process.crash()
    }
})

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
    writeConfig: (config: ConfigCoreStruct, version: number) => ipcRenderer.invoke('config:writeConfig', config, version),
    resetConfig: (version: number | null = null) => ipcRenderer.invoke('config:resetConfig', version),
});

/* The list of channels the ipcRenderer is allowed to act upon */
const channelAllowList = [
    'restart-finished-loading'
];

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        on(channel: string, listener: (evt: IpcRendererEvent, message: any) => void): void {
            if (!channelAllowList.includes(channel)) {
                return;
            }

            ipcRenderer.on(channel, (event, message) => listener(event, message));
        },
        removeListener(channel: string, listener: (evt: IpcRendererEvent, message: any) => void): void {
            if (!channelAllowList.includes(channel)) {
                return;
            }

            ipcRenderer.removeListener(channel, listener);
        },
    },
});
