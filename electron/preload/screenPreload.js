const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')

function onNodeClick (data) {
    ipcRenderer.invoke('on-onNodeClick-event', data)
}

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    onNodeClick,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

