const { contextBridge } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const viewApi = require('./modules/window')
const run = require('../utils/run')

contextBridge.exposeInMainWorld('appApi', {
    ...common
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('viewApi', {
    ...viewApi
})

contextBridge.exposeInMainWorld('run', (code, device) => { return run(code, device) })

