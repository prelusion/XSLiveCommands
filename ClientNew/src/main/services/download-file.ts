import {app, BrowserWindow, dialog} from 'electron'
import {join} from 'path'
import {arch, platform} from 'os'
import {stat, remove} from 'fs-extra'
import packageInfo from '../../../package.json'


/**
 * @description
 * @returns {void} Download class
 * @param {mainWindow} Main window
 * @param {downloadUrl} Download URL, if not provided, the pre-set baseUrl will be used to form the name
 * @author Sky
 * @date 2020-08-12
 */

class Main {

    public readonly mainWindow: BrowserWindow
    public downloadUrl: string = ""
    public version: string = packageInfo.version
    public baseUrl: string = ''
    public Sysarch: string = arch().includes('64') ? 'win64' : 'win32'
    public HistoryFilePath = join(app.getPath('downloads'), platform().includes('win32') ? `electron_${this.version}_${this.Sysarch}.exe` : `electron_${this.version}_mac.dmg`)

    constructor(mainWindow: BrowserWindow, downloadUrl?: string) {
        this.mainWindow = mainWindow
        this.downloadUrl = downloadUrl || platform().includes('win32') ? this.baseUrl + `electron_${this.version}_${this.Sysarch}.exe?${new Date().getTime()}` : this.baseUrl + `electron_${this.version}_mac.dmg?${new Date().getTime()}`
    }

    start() {
        /* Check for files with the same name during the update, delete if found, otherwise start the download */
        stat(this.HistoryFilePath, async (err, stats) => {
            try {
                if (stats) {
                    await remove(this.HistoryFilePath)
                }
                this.mainWindow.webContents.downloadURL(this.downloadUrl)
            } catch (error) {
                console.log(error)
            }
        })
        this.mainWindow.webContents.session.on('will-download', (event: any, item: any, webContents: any) => {
            const filePath = join(app.getPath('downloads'), item.getFilename())
            item.setSavePath(filePath)
            item.on('updated', (event: any, state: String) => {
                switch (state) {
                    case 'progressing':
                        this.mainWindow.webContents.send('download-progress', (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0))
                        break
                    default:
                        this.mainWindow.webContents.send('download-error', true)
                        dialog.showErrorBox('Download Error', 'An error occurred during the download due to network or other unknown reasons')
                        break
                }
            })
            item.once('done', (event: any, state: String) => {
                switch (state) {
                    case 'completed':
                        const data = {
                            filePath
                        }
                        this.mainWindow.webContents.send('download-done', data)
                        break
                    case 'interrupted':
                        this.mainWindow.webContents.send('download-error', true)
                        dialog.showErrorBox('Download Error', 'An error occurred during the download due to network or other unknown reasons.')
                        break
                    default:
                        break
                }
            })
        })
    }
}

export default Main
