'use strict'

const { contextBridge, ipcRenderer } = require('electron');

// In this file we want to expose protected methods that allow the renderer
// process to use the ipcRenderer without exposing the entire object.

// !!! REMEMBER !!!
// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'
contextBridge.exposeInMainWorld("axios", {
    get: (url) => ipcRenderer.invoke('axios:get', url),
    getChallenges: (gameMode) => ipcRenderer.invoke('axios:getChallenges', gameMode),
    getChallengeLimiters: (gameMode) => ipcRenderer.invoke('axios:getChallengeLimiters', gameMode),
    getCommands: (gameMode) => ipcRenderer.invoke('axios:getCommands', gameMode),
    getRuleSet: (gameMode) => ipcRenderer.invoke('axios:getRuleSet', gameMode),
    getCivModifier: (gameMode) => ipcRenderer.invoke('axios:getCivModifier', gameMode),
    getMapModifier: (gameMode) => ipcRenderer.invoke('axios:getMapModifier', gameMode),
    getMaps: (gameMode) => ipcRenderer.invoke('axios:getMaps', gameMode),
});

// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'
contextBridge.exposeInMainWorld("fs", {
    getProfile: (id) => ipcRenderer.invoke('fs:getProfile', id),
    getProfiles: (ids=[]) => ipcRenderer.invoke('fs:getProfiles', ids),
    getProfileIds: () => ipcRenderer.invoke('fs:getProfileIds'),
    createProfile: (id, points, colour) => ipcRenderer.invoke('fs:createProfile', id, points, colour),
    editProfile: (id, key, value) => ipcRenderer.invoke('fs:editProfile', id, key, value),
    adjustProfilePoints: (id, value) => ipcRenderer.invoke('fs:adjustProfilePoints', id, value),
    removeProfile: (id) => ipcRenderer.invoke('fs:removeProfile', id),
});

// ALL THE CONTEXT BRIDGE CONSTRUCTIONS NEED TO BE DEFINED IN: '/src/main.ts'
contextBridge.exposeInMainWorld("clipboard", {
    copy: (text) => ipcRenderer.invoke('clipboard:copy', text),
});
