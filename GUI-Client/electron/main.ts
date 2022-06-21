import dotenv from "dotenv";
import {app, BrowserWindow} from "electron";
import path from "path";

try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("electron-reloader")(
        module, {
            // Ignore items for Electron Reloads. Webpack rebuilds aren't affected by this.
            // For Webpack rebuilds, check vue.config.js (bottom of the file)
            ignore: [
                path.join(__dirname, "..", "..", "src"),
                path.join(__dirname, "..", "..", "logs"),
                path.join(__dirname, "..", "..", "node_modules"),
            ],
        },
    );
} catch (_) {
    // Module doesn't exist. Ignored because of HUGE ERROR and module doesn't have to exist in production
}

dotenv.config();

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
async function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        await win.loadFile(path.join(__dirname, "..", "src", "index.html"));
        win.webContents.openDevTools();
    }
    // ToDo: Check the path in this, it probably broke after ts-ification:
    // Production
    else {
        await win.loadFile(path.join(__dirname, "..", "app", "index.html"));
    }
}

/**
 * Called when Electron has finished initialization and is ready to create
 * browser windows.
 *
 * Some APIs can only be used after this event occurs.
 */
app.on("ready", () => {
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the dock icon
        // is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

/**
 * Quit when all windows are closed, except on macOS. There, it's common for
 * applications and their menu bar to stay active until the user quits
 * explicitly with Cmd + Q.
 */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        win = null;
        app.quit();
    }
});

// Below you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.

// Regedit - Handling network requests
require("./libs/regedit");

// Regedit - Handling network requests
require("./libs/dialog");

// Regedit - Handling network requests
require("./libs/fs");
