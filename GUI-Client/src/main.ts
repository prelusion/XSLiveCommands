'use strict'

import {createApp} from 'vue';
import App from './App.vue';
import store from "@/store";

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
    }
}
