/* This defines the location of the static file path */
import { join } from 'path'
import config from '@config/index'
import { app } from 'electron'

const env = app.isPackaged ? 'production' : 'development'

const filePath = {
  winURL: {
    development: `http://localhost:${process.env.PORT}`,
    production: `file://${join(app.getAppPath(), "dist", "electron", 'renderer', 'index.html')}`
  },
  __static: {
    development: join(__dirname, "..", "..", "..", "src", 'renderer', "public").replace(/\\/g, '\\\\'),
    production: join(app.getAppPath(), "dist", "electron", 'renderer').replace(/\\/g, '\\\\')
  },
  getPreloadFile(fileName: string) {
    if (env !== 'development') {
      return join(app.getAppPath(), "dist", "electron", "main", `${fileName}.js`)
    }
    return join(app.getAppPath(), `${fileName}.js`)
  }
}

process.env.__static = filePath.__static[env]

process.env.__lib = getAppRootPath(config.DllFolder)
process.env.__updateFolder = getAppRootPath(config.HotUpdateFolder)

function getAppRootPath(path: string) {
  return env !== 'development' ? join(__dirname, '..', '..', '..', '..', path).replace(/\\/g, '\\\\') : join(__dirname, '..', '..', '..', path).replace(/\\/g, '\\\\')
}

export const winURL = filePath.winURL[env]
export const lib = process.env.__lib
export const updateFolder = process.env.__updateFolder
export const getPreloadFile = filePath.getPreloadFile

