const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adb = require('./modules/adb')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    ...adb
})

contextBridge.exposeInMainWorld('view', {
    ...view
})

