"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.
// !!! REMEMBER !!!
// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'
electron_1.contextBridge.exposeInMainWorld('regedit', {
    getSteamId: () => electron_1.ipcRenderer.invoke('regedit:getSteamId'),
});
electron_1.contextBridge.exposeInMainWorld('dialog', {
    select: (steamId) => electron_1.ipcRenderer.invoke('dialog:select', steamId),
});
electron_1.contextBridge.exposeInMainWorld('fs', {
    deleteXsDataFiles: (steamId, scenario) => electron_1.ipcRenderer.invoke('fs:deleteXsDataFiles', steamId, scenario),
    readCycle: (steamId, scenario) => electron_1.ipcRenderer.invoke('fs:readCycle', steamId, scenario),
    readCommands: (path) => electron_1.ipcRenderer.invoke('fs:readCommands', path),
    writeEvent: (steamId, scenario, event) => electron_1.ipcRenderer.invoke('fs:writeEvent', steamId, scenario, event),
});
electron_1.contextBridge.exposeInMainWorld('clipboard', {
    write: (text) => electron_1.ipcRenderer.invoke('clipboard:write', text),
});
//# sourceMappingURL=preload.js.map