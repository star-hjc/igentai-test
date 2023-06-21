const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const viewApi = require('./modules/window')
const adbApi = require('./modules/adb')
const run = require('../utils/run')
const cpuApi = require('./modules/cpu')
const opencvApi = require('./modules/opencv')
const path = require('path')
const log = require('electron-log')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('viewApi', {
    ...viewApi
})

contextBridge.exposeInMainWorld('opencvApi', {
    ...opencvApi
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('cpuApi', {
    ...cpuApi
})

contextBridge.exposeInMainWorld('run', (code, device, callback, num) => { return run(code, device, callback, num) })

;(async () => {
    const assetsPath = await common.getAssetsPath()
    log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}'
    log.transports.file.resolvePath = () => path.join(assetsPath, 'log/main.log')
    Object.assign(console, log.functions)
    log.catchErrors()
})()
