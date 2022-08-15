import {app, BrowserWindow, ipcMain, shell} from "electron";
import {join} from "path";
import {release} from "os";
import dotenv from "dotenv";

dotenv.config();

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

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
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
const indexHtml = join(ROOT_PATH.dist, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 300,
        title: '0000000000000',
        // icon: join(ROOT_PATH.public, 'favicon.ico'),
        webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
        },
    })

    if (app.isPackaged) {
        win.loadFile(indexHtml)
    } else {
        win.loadURL(url)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) {
            shell.openExternal(url)
        }
        return {action: 'deny'}
    })
}

app.whenReady().then(createWindow);

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

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
        },
    })

    if (app.isPackaged) {
        childWindow.loadFile(indexHtml, {hash: arg})
    } else {
        childWindow.loadURL(`${url}/#${arg}`)
        childWindow.webContents.openDevTools({mode: "undocked", activate: true})
    }
})

// Below you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.

// Regedit - Handling registry requests
import("../libs/regedit");

// dialog - Handling electron dialog
import("../libs/dialog");

// fs - Handling file system calls
import("../libs/fs");

// Clipboard - Handling clipboard actions
import("../libs/clipboard");

// Electron - Handling electron actions
import("../libs/manager");

// Electron - Handling config reading and writing
import("../libs/config");
