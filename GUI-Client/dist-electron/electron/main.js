"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const electron_1 = require("electron");
const path_1 = tslib_1.__importDefault(require("path"));
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("electron-reloader")(module, {
        // Ignore items for Electron Reloads. Webpack rebuilds aren't affected by this.
        // For Webpack rebuilds, check vue.config.js (bottom of the file)
        ignore: [
            path_1.default.join(__dirname, "..", "..", "src"),
            path_1.default.join(__dirname, "..", "..", "logs"),
            path_1.default.join(__dirname, "..", "..", "node_modules"),
        ],
    });
}
catch (_) {
    // Module doesn't exist. Ignored because of HUGE ERROR and module doesn't have to exist in production
}
dotenv_1.default.config();
const isDev = process.env.NODE_ENV === "development";
// Keep a global reference of the window object. If you don't, the window will
// be closed automatically when the JS object is garbage collected.
let win;
/**
 * Creates the browser window with the specified options.
 *
 * We also use a preload script to pass functions to the front-end but it can
 * be removed if you don't need it.
 */
function createWindow() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        win = new electron_1.BrowserWindow({
            width: 600,
            height: 300,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path_1.default.join(__dirname, "preload.js"),
            },
        });
        if (isDev) {
            yield win.loadFile(path_1.default.join(__dirname, "..", "src", "index.html"));
            win.webContents.openDevTools();
        }
        // ToDo: Check the path in this, it probably broke after ts-ification:
        // Production
        else {
            yield win.loadFile(path_1.default.join(__dirname, "..", "app", "index.html"));
        }
    });
}
/**
 * Called when Electron has finished initialization and is ready to create
 * browser windows.
 *
 * Some APIs can only be used after this event occurs.
 */
electron_1.app.on("ready", () => {
    createWindow();
    electron_1.app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the dock icon
        // is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
/**
 * Quit when all windows are closed, except on macOS. There, it's common for
 * applications and their menu bar to stay active until the user quits
 * explicitly with Cmd + Q.
 */
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        win = null;
        electron_1.app.quit();
    }
});
// Below you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.
// Regedit - Handling registry requests
require("./libs/regedit");
// dialog - Handling electron dialog
require("./libs/dialog");
// fs - Handling file system calls
require("./libs/fs");
// Clipboard - Handling clipboard actions
require("./libs/clipboard");
//# sourceMappingURL=main.js.map