const argv = process.argv;
const isBuildCall = argv[2] === "electron:build"

// vue.config.js
module.exports = {

    pluginOptions: {
        electronBuilder: {
            // If you want to use the file:// protocol, add win.loadURL(`file://${__dirname}/index.html`) to your main process file
            // In place of win.loadURL('app://./index.html'), and set customFileProtocol to './'
            customFileProtocol: './',

            // List native deps here if they don't work
            externals: ['fs', 'native-reg'],

            // If you are using Yarn Workspaces, you may have multiple node_modules folders
            // List them all here so that VCP Electron Builder can find them
            nodeModulesPath: ['./node_modules'],

            // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/guide.html#preload-files
            preload: 'electron/preload.ts',
            // Or, for multiple preload files:
            // preload: { preload: 'src/preload.js', otherPreload: 'src/preload2.js' }

            // chainWebpackMainProcess: (config) => {
            //     // Chain webpack config for electron main process only
            // },
            // chainWebpackRendererProcess: (config) => {
            //     // Chain webpack config for electron renderer process only (won't be applied to web builds)
            // },

            // Use this to change the entrypoint of your app's main process
            mainProcessFile: 'electron/main.ts',
            // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
            rendererProcessFile: 'src/main.ts',

            // Provide an array of files that, when changed, will recompile the main process and restart Electron
            // Your main process file will be added by default
            mainProcessWatch: ['electron/*'],
            // Provide a list of arguments that Electron will be launched with during "electron:serve",
            // which can be accessed from the main process (src/background.js).
            // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
            // Command line args (excluding --debug, --dashboard, and --headless) are passed to Electron as well
            mainProcessArgs: [],

            builderOptions: {
                productName: 'XS Live Commands',
            }
        }
    }
}


// module.exports = {
//     outputDir: "./dist/src",
//     // Needs to be '' so that the built html file doesn't output asset filenames with a forward slash.
//     publicPath: '',
//     configureWebpack: {
//         mode: isBuildCall ? "production" : "development",
//         output: {
//             // The filenames need to have a ./ otherwise Electron won't be able to find the files.
//             filename: './[name].js',
//             chunkFilename: './[name].js',
//         },
//         watchOptions: {
//             // Ignore items for webpack rebuilds. Electron reloads aren't affected by this
//             // For electron reloads, check electron/main.js (top of the file)
//             ignored: [
//                 'node_modules/**/*',
//                 'logs/**/*',
//                 'public/**/*'
//             ],
//         }
//     },
//     css: {
//         loaderOptions: {
//             // sass: {
//             //     prependData: `
//             //     @import "@/assets/styles/_variables.scss";
//             //     @import "@/assets/styles/_classes.scss";
//             //     `
//             // }
//         }
//     },
//     pluginOptions: {
//         electronBuilder: {
//             // If you want to use the file:// protocol, add win.loadURL(`file://${__dirname}/index.html`) to your main process file
//             // In place of win.loadURL('app://./index.html'), and set customFileProtocol to './'
//             customFileProtocol: './',
//
//             // List native deps here if they don't work
//             externals: [],
//             preload: './dist/electron/preload.js',
//             // Use this to change the entrypoint of your app's main process
//             mainProcessFile: './dist/electron/main.js',
//             // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
//             rendererProcessFile: './src/main.ts',
//             // Manually disable typescript plugin for main process.
//             // Enable if you want to use regular js for the main process (src/background.js by default).
//             disableMainProcessTypescript: true,
//
//             builderOptions: {
//                 productName: 'XS Live Commands',
//
//                 // Electron packing. Setting this to false results in a warning when building.
//                 // I'm not sure why it is not recommended. I might get back to this in the future^tm.
//                 asar: false,
//                 extraResources: [
//                     {
//                         from: "./bin",
//                         to: "bin",
//                         filter: [
//                             "**/*"
//                         ]
//                     }
//                 ],
//                 // "files": [
//                 //     {
//                 //         "from": "./ElectronHostHook/node_modules",
//                 //         "to": "ElectronHostHook/node_modules",
//                 //         "filter": [
//                 //             "**/*"
//                 //         ]
//                 //     },
//                 //     "**/*"
//                 // ]
//             }
//         }
//     }
// }
