const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const viewApi = require('./modules/window')
const adbApi = require('./modules/adb')
const run = require('../utils/run')
const cpuApi = require('./modules/cpu')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('viewApi', {
    ...viewApi
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('cpuApi', {
    ...cpuApi
})

contextBridge.exposeInMainWorld('run', (code, device) => { return run(code, device) })
