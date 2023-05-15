const { contextBridge, ipcRenderer } = require('electron')
const adbApi = require('./modules/adb')
const common = require('./modules/common')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('viewApi', {
    ...view
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('run', (code, device) => {
    const adb = {}
    if (/.*require\(.*/.test(code)) return
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    // eslint-disable-next-line no-unused-vars
    async function DOM () {
        return new DOMParser().parseFromString(await adb.getUI(), 'text/xml')
    }
    // eslint-disable-next-line no-unused-vars
    async function querySelector (str, num) {
        if (!isNaN(num / 1)) return (await DOM()).querySelectorAll(str)[num]
        return (await DOM()).querySelectorAll(str)
    }
    // eslint-disable-next-line no-eval
    return eval(`(async()=>{${code}})()`)
})
