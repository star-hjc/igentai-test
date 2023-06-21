const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const view = require('./modules/window')
const path = require('path')
const log = require('electron-log')
contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('log', {
    ...log
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('viewApi', {
    ...view
})

;(async () => {
    const assetsPath = await common.getAssetsPath()
    log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}'
    log.transports.file.resolvePath = () => path.join(assetsPath, 'log/main.log')
    Object.assign(console, log.functions)
    log.catchErrors()
})()

