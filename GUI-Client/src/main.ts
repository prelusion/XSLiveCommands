"use strict";

import {select} from "@/../electron/libs/dialog";
import {deleteXsDataFiles, readCycle, writeEvent} from "@/../electron/libs/fs";
import {getSteamId} from "@/../electron/libs/regedit";
import store from "@/store";
import {createApp} from "vue";
import App from "./App.vue";
import {write} from "../electron/libs/clipboard";


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
            writeEvent: typeof writeEvent;
        };
        clipboard: {
            write: typeof write;
        };
    }
}
