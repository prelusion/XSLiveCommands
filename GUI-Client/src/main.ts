"use strict";

import {select} from "@/../electron/libs/dialog";
import {
    deleteXsDataFiles,
    exists,
    getCompatibleMaps,
    readCommands,
    readCycle,
    readModsJson,
    writeEvent,
} from "@/../electron/libs/fs";
import {getSteamId} from "../electron/libs/native-reg";
import {createApp} from "vue";
import {write} from "../electron/libs/clipboard";
import {getEnvVar, resize} from "../electron/libs/manager";
import {readConfig, resetConfig, writeConfig} from "../electron/libs/config";
import App from "./App.vue";
import store from "./store";

createApp(App)
    .use(store)
    .mount('#app');

// Register all exposed variables here (from '/electron/preload.js')
declare global {
    interface Window {
        registry: {
            getSteamId: typeof getSteamId;
        };
        fs: {
            deleteXsDataFiles: typeof deleteXsDataFiles;
            readCycle: typeof readCycle;
            readCommands: typeof readCommands;
            writeEvent: typeof writeEvent;
            readModsJson: typeof readModsJson;
            getCompatibleMaps: typeof getCompatibleMaps;
            exists: typeof exists;
        };
        clipboard: {
            write: typeof write;
        };
        manager: {
            resize: typeof resize;
            getEnvVar: typeof getEnvVar;
        };
        config: {
            readConfig: typeof readConfig;
            writeConfig: typeof writeConfig;
            resetConfig: typeof resetConfig;
        };
    }
}