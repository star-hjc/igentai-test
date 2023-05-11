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

contextBridge.exposeInMainWorld('run', (code, device) => {
    const adb = {}
    if (/.*require\(.*/.test(code)) return
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    // eslint-disable-next-line no-eval
    return eval(`(async()=>{${code}})()`)
})
