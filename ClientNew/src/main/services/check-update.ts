import {autoUpdater} from 'electron-updater'
import {BrowserWindow} from 'electron'

/**
 * -1  Update check failed
 *  0  Checking for updates
 *  1  New version detected, preparing to download
 *  2  No new version detected
 *  3  Downloading
 *  4  Download complete
 */
class Update {
    public mainWindow: BrowserWindow

    constructor() {
        /* Set the URL */
        autoUpdater.setFeedURL('http://127.0.0.1:25565/');

        /* Triggered when an update error occurs */
        autoUpdater.on('error', (err) => {
            console.log('Error occurred during update', err.message);
            if (err.message.includes('sha512 checksum mismatch')) {
                this.Message(this.mainWindow, -1, 'sha512 checksum failed');
            } else {
                this.Message(this.mainWindow, -1, 'For error details, see the main process console');
            }
        });

        /* Triggered when checking for updates starts */
        autoUpdater.on('checking-for-update', () => {
            console.log('Starting to check for updates');
            this.Message(this.mainWindow, 0);
        });

        /* When update data is found */
        autoUpdater.on('update-available', () => {
            console.log('Update available');
            this.Message(this.mainWindow, 1);
        });

        /* When no update data is found */
        autoUpdater.on('update-not-available', () => {
            console.log('No updates available');
            this.Message(this.mainWindow, 2);
        });

        /* Download progress listener */
        autoUpdater.on('download-progress', (progressObj) => {
            this.Message(this.mainWindow, 3, `${progressObj}`);
        });

        /* Download complete */
        autoUpdater.on('update-downloaded', () => {
            console.log('Download completed');
            this.Message(this.mainWindow, 4);
        });
    }

    /* Responsible for sending messages to the renderer process */
    Message(mainWindow: BrowserWindow, type: Number, data?: String) {
        const senddata = {
            state: type,
            msg: data || ''
        }
        mainWindow.webContents.send('update-msg', senddata);
    }

    /* Perform automatic update check */
    checkUpdate(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow
        autoUpdater.checkForUpdates().catch(err => {
            console.log('Network connection issue', err);
        });
    }

    /* Quit and install */
    quitAndInstall() {
        autoUpdater.quitAndInstall();
    }
}

export default Update
