import {app, BrowserWindow, dialog, ipcMain} from 'electron'
import {getPreloadFile, winURL} from '../config/static-path'
import {updater} from './hot-updater'
import DownloadFile from './download-file'
import Update from './check-update'
import config from '@config/index'
import {ensure} from '../../shared/src/util/general';

export const useMainDefaultIpc = () => {
    const defaultIpc = () => {
        const allUpdater = new Update();
        ipcMain.handle('app-close', (event, args) => {
            app.quit()
        });

        ipcMain.handle('check-update', (event) => {
            allUpdater.checkUpdate(ensure(BrowserWindow.fromWebContents(event.sender)))
        });

        ipcMain.handle('confirm-update', () => {
            allUpdater.quitAndInstall()
        });

        ipcMain.handle('open-messagebox', async (event, arg) => {
            return await dialog.showMessageBox(ensure(BrowserWindow.fromWebContents(event.sender)), {
                type: arg.type || 'info',
                title: arg.title || '',
                buttons: arg.buttons || [],
                message: arg.message || '',
                noLink: arg.noLink || true
            })
        })

        ipcMain.handle('open-errorbox', (event, arg) => {
            dialog.showErrorBox(arg.title, arg.message)
        })

        ipcMain.handle('hot-update', (event, arg) => {
            updater(ensure(BrowserWindow.fromWebContents(event.sender)))
        })

        ipcMain.handle('start-download', (event, msg) => {
            new DownloadFile(ensure(BrowserWindow.fromWebContents(event.sender)), msg.downloadUrl).start()
        })

        ipcMain.handle('open-win', (event, arg) => {
            const childWindow = new BrowserWindow({
                titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
                height: 595,
                useContentSize: true,
                width: 1140,
                autoHideMenuBar: true,
                minWidth: 842,
                frame: config.IsUseSysTitle,
                show: false,
                webPreferences: {
                    sandbox: false,
                    webSecurity: false,
                    devTools: process.env.NODE_ENV === 'development',
                    scrollBounce: process.platform === 'darwin',
                    preload: getPreloadFile('preload')
                }
            })

            /* Automatically open devtools in development mode */
            if (process.env.NODE_ENV === 'development') {
                childWindow.webContents.openDevTools({mode: 'undocked', activate: true})
            }

            childWindow.loadURL(winURL + `#${arg.url}`)
            childWindow.once('ready-to-show', () => {
                childWindow.show()
            })

            /* Fires when the rendering process is displayed */
            childWindow.once("show", () => {
                childWindow.webContents.send('send-data', arg.sendData)
            });
        });
    }
    return {
        defaultIpc
    }
}
