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

const adb = {}

contextBridge.exposeInMainWorld('run', (code,device)=>{
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    // eslint-disable-next-line no-eval
    return eval(`(async()=>{try {${code}} catch (error) {return false}})()`)
})
