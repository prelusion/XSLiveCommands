'use strict'

const { contextBridge, ipcRenderer } = require('electron');

// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.

// !!! REMEMBER !!!
// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'
contextBridge.exposeInMainWorld('regedit', {
    getSteamId: () => ipcRenderer.invoke('regedit:getSteamId'),
});

contextBridge.exposeInMainWorld('fileControls', {
    select: (steamId) => ipcRenderer.invoke('fileControls:select', steamId),
});

contextBridge.exposeInMainWorld('fs', {
    deleteXsDataFiles: (steamId, scenario) => ipcRenderer.invoke('fs:deleteXsDataFiles', steamId, scenario),
    readCycle: (steamId, scenario) => ipcRenderer.invoke('fs:readCycle', steamId, scenario),
    writeEvent: (steamId, scenario, event) => ipcRenderer.invoke('fs:readCycle', steamId, scenario, event),
})
