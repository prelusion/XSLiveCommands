'use strict'

import {createApp} from 'vue';
import App from './App.vue';
import store from "@/store";
import {CommandEvent} from "@/interfaces/general";

createApp(App)
    .use(store)
    .mount('#app');

// Register all exposed variables here (from '/electron/preload.js')
declare global {
    interface Window {
        regedit: {
            getSteamId(): Promise<string>;
        };
        fileControls: {
            select(steamId: string): Promise<{ filepath: string; reason: string }>;
        };
        fs: {
            deleteXsDataFiles(steamId: string, scenario: string): Promise<boolean>;
            readCycle(steamId: string, scenario: string): Promise<number | undefined>;
            writeEvent(steamId: string, scenario: string, event: CommandEvent): Promise<boolean>;
        };
    }
}
