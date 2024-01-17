import path from "path";
import vue from '@vitejs/plugin-vue'
import {defineConfig, externalizeDepsPlugin} from 'electron-vite'

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    main: {
        // build: {
        //     rollupOptions: {
        //         input: {
        //             index: path.join(__dirname, 'electron', 'main', 'index.ts')
        //         }
        //     }
        // },
        plugins: [externalizeDepsPlugin()],
    },
    preload: {
        // build: {
        //     rollupOptions: {
        //         input: {
        //             index: path.join(__dirname, 'electron', 'preload', 'index.ts')
        //         }
        //     }
        // },
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': path.resolve('src/renderer/src')
            }
        },
        plugins: [vue()]
    }
});
