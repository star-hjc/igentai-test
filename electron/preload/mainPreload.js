const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const { getDevices } = require('./modules/adb')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    getDevices
})
