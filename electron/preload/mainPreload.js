const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})
