const { contextBridge } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('view', {
    ...view
})

contextBridge.exposeInMainWorld('run', (code, device) => {
    const adb = {}
    if (/.*require\(.*/.test(code)) return
    // select.prototype
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    // eslint-disable-next-line no-eval
    return eval(`(async()=>{${code}})()`)
})

