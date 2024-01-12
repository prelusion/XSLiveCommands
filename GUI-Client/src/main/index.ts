import {app, BrowserWindow, shell} from "electron";
import {join} from "path";
import {release} from "os";
import dotenv from "dotenv";
import {ensure} from "../shared/src/util/general";

dotenv.config();

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) {
    app.disableHardwareAcceleration()
}

/* Exit the application if another instance is already running */
// if (!app.requestSingleInstanceLock()) {
//     app.quit()
//     process.exit(1)
// }

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
    // /dist
    dist: join(__dirname, '../..'),
    // /dist or /public
    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
}

export let win: BrowserWindow | null = null

const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow(): Promise<void> {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        // Shown in first part of starting the app
        title: 'XS Live Commands is starting...',
        // icon: join(ROOT_PATH.public, 'favicon.ico'),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    win.on('ready-to-show', () => {
        ensure(win).show()
    });

    win.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {action: 'deny'}
    })

    if (app.isPackaged) {
        await win.loadFile(indexHtml);
        win.setMenu(null);
    } else {
        await win.loadURL(ensure(process.env['ELECTRON_RENDERER_URL']));
        win.webContents.openDevTools();
    }

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url)
        }
        return {action: 'deny'}
    });

    disableCorsCheck(win);
}

app.whenReady().then(async () => {
    /* Set application name for Windows 10+ notifications */
    if (process.platform === 'win32') {
        app.setAppUserModelId(app.getName());
    }

    // /**
    //  * Disable hard refresh in production, and allow F12 in development
    //  * @link https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    //  */
    // app.on('browser-window-created', (_, window) => {
    //     optimizer.watchWindowShortcuts(window);
    // });

    await createWindow();
});

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) {
            win.restore();
        }
        win.focus();
    }
});

app.on('activate', async () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        await createWindow();
    }
});

// // new window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//     const childWindow = new BrowserWindow({
//         webPreferences: {
//             preload: join(__dirname, '../preload/index.js'),
//         },
//     });
//
//     if (app.isPackaged) {
//         childWindow.loadFile(indexHtml, {hash: arg});
//     } else {
//         childWindow.loadURL(`${url}/#${arg}`)
//         childWindow.webContents.openDevTools({mode: "undocked", activate: true});
//     }
// })

/**
 * Disable CORS checks as the internal vite doesn't like it when requests are sent to other servers too. (Jealous much?)
 * @param win The window to disable CORS checks for
 */
function disableCorsCheck(win: BrowserWindow): void {
    // Disable CORS
    win.webContents.session.webRequest.onBeforeSendHeaders(
        (details, callback) => {
            callback({requestHeaders: {Origin: '*', ...details.requestHeaders}});
        },
    );

    // Disable CORS
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                'Access-Control-Allow-Origin': ['*'],
                ...details.responseHeaders,
            },
        });
    });
}

// Deal with this shit later (conditionally import only when in dev mode)
// (async () => {
//     if (!app.isPackaged) {
//         // TYPES DECLARATION IS OUTDATED.
//         const installExtension = await import('electron-devtools-installer');
//         const {VUEJS_DEVTOOLS} = await import('electron-devtools-installer');
//
//         // // Causes bundle warnings:
//         // // https://github.com/electron/electron/issues/32133 (doesn't seem to get fixed soon)
//         app.whenReady().then(() => {
//             installExtension(VUEJS3_DEVTOOLS)
//                 .then((name: string) => console.log(`Added Extension:  ${name}`))
//                 .catch((err: ErrorEvent) => console.log('An error occurred: ', err));
//         });
//     }
// })();

// Below you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.

// Native-reg - Handling registry requests
import("./libs/native-reg");

// dialog - Handling electron dialog
import("./libs/dialog");

// fs - Handling file system calls
import("./libs/fs");

// Clipboard - Handling clipboard actions
import("./libs/clipboard");

// Electron - Handling electron actions
import("./libs/manager");

// Electron - Handling config reading and writing
import("./libs/config");
