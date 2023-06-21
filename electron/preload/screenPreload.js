const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const path = require('path')
const log = require('electron-log')

function onNodeClick (data) {
    ipcRenderer.invoke('on-onNodeClick-event', data)
}

function onRefreshScreenshot (data) {
    ipcRenderer.invoke('on-onRefreshScreenshot-event', data)
}

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    onNodeClick,
    onRefreshScreenshot,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

;(async () => {
    const assetsPath = await common.getAssetsPath()
    log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}'
    log.transports.file.resolvePath = () => path.join(assetsPath, 'log/main.log')
    Object.assign(console, log.functions)
    log.catchErrors()
})()
