"use strict";

import {select} from "@/../electron/libs/dialog";
import {
    deleteXsDataFiles,
    exists,
    getCompatibleScenarios,
    readCommands,
    readCycle,
    readModsJson,
    writeEvent,
} from "@/../electron/libs/fs";
import {getSteamId} from "@/../electron/libs/regedit";
import store from "@/store";
import {createApp} from "vue";
import {write} from "../electron/libs/clipboard";
import {getEnvVar, resize} from "../electron/libs/manager";
import {readConfig, resetConfig, writeConfig} from "../electron/libs/config";
import App from "./App.vue";


createApp(App)
    .use(store)
    .mount("#app");

// Register all exposed variables here (from '/electron/preload.js')
declare global {
    interface Window {
        regedit: {
            getSteamId: typeof getSteamId;
        };
        dialog: {
            select: typeof select;
        };
        fs: {
            deleteXsDataFiles: typeof deleteXsDataFiles;
            readCycle: typeof readCycle;
            readCommands: typeof readCommands;
            writeEvent: typeof writeEvent;
            readModsJson: typeof readModsJson;
            getCompatibleScenarios: typeof getCompatibleScenarios;
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