const argv = process.argv;
const isBuildCall = argv[2] === "electron:build"

module.exports = {
    // Needs to be '' so that the built html file doesn't output asset filenames with a forward slash.
    publicPath: '',
    configureWebpack: {
        mode: isBuildCall ? "production" : "development",
        output: {
            // The filenames need to have a ./ otherwise Electron won't be able to find the files.
            filename: './[name].js',
            chunkFilename: './[name].js',
        },
        watchOptions: {
            // Ignore items for webpack rebuilds. Electron reloads aren't affected by this
            // For electron reloads, check electron/main.js (top of the file)
            ignored: [
                'node_modules/**/*',
                'logs/**/*',
                'public/**/*'
            ],
        }
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                @import "@/assets/styles/_variables.scss";
                @import "@/assets/styles/_classes.scss";
                `
            }
        }
    },
    pluginOptions: {
        electronBuilder: {
            // If you want to use the file:// protocol, add win.loadURL(`file://${__dirname}/index.html`) to your main process file
            // In place of win.loadURL('app://./index.html'), and set customFileProtocol to './'
            customFileProtocol: './',

            // List native deps here if they don't work
            externals: [],
            preload: './electron/preload.js',
            // Use this to change the entrypoint of your app's main process
            mainProcessFile: './electron/main.js',
            // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
            rendererProcessFile: './src/main.ts',
            // Manually disable typescript plugin for main process.
            // Enable if you want to use regular js for the main process (src/background.js by default).
            disableMainProcessTypescript: true,

            builderOptions: {
                productName: 'AoE2 2v1',

                // Electron packing. Setting this to false results in a warning when building.
                // I'm not sure why it is not recommended. I might get back to this in the future^tm.
                asar: false,

                // extraResources: [
                    // {
                    //     "from": "./extraResources/",
                    //     "to": "extraResources",
                    //     "filter": [
                    //         "**/*"
                    //     ]
                    // }
                // ]
            }
        }
    }
}
