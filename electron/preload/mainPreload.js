const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('viewApi', {
    ...view
})
