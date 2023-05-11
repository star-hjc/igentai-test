const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')

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

