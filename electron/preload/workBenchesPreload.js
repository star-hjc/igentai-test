const { contextBridge, ipcRenderer } = require('electron')
const adb = require('./modules/adb')
const common = require('./modules/common')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('view', {
    ...view
})

contextBridge.exposeInMainWorld('adb', {
    ...adb
})
