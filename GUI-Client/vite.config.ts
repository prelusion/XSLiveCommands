import path from "path";
import vue from '@vitejs/plugin-vue'
import {rmSync} from "fs";
import {
    type Plugin,
    type UserConfig,
    defineConfig,
} from 'vite'
import electron from 'vite-plugin-electron'
import pkg from './package.json'
import {fileURLToPath} from "url";

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),

        electron({
            main: {
                entry: path.join(__dirname, 'electron', 'main', 'index.ts'),
                vite: withDebug({
                    build: {
                        outDir: 'dist/electron/main',
                    },
                }),
            },
            preload: {
                input: {
                    // You can configure multiple preload here
                    index: path.join(__dirname, 'electron', 'preload', 'index.ts'),
                },
                vite: {
                    build: {
                        // For Debug
                        sourcemap: 'inline',
                        outDir: 'dist/electron/preload',
                    },
                    optimizeDeps: {
                        entries: [
                            'electron', 'fs'
                        ],
                    }
                },
            },
            // Enables use of Node.js API in the Renderer-process
            // https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#electron-renderervite-serve
            renderer: {},
        }),
    ],
    server: {
        host: pkg.env.VITE_DEV_SERVER_HOST,
        port: pkg.env.VITE_DEV_SERVER_PORT,

        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});

function withDebug(config: UserConfig): UserConfig {
    if (process.env.VSCODE_DEBUG) {
        if (!config.build) config.build = {}
        config.build.sourcemap = true

        config.plugins = (config.plugins || []).concat({
            name: 'electron-vite-debug',
            configResolved(config) {
                const index = config.plugins.findIndex(p => p.name === 'electron-main-watcher');
                // At present, Vite can only modify plugins in configResolved hook.
                (config.plugins as Plugin[]).splice(index, 1)
            },
        })
    }
    return config
}
