const { contextBridge } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const viewApi = require('./modules/window')
const run = require('../utils/run')
const path = require('path')
const log = require('electron-log')

contextBridge.exposeInMainWorld('appApi', {
    ...common
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('viewApi', {
    ...viewApi
})

contextBridge.exposeInMainWorld('run', (code, device, callback, num) => { return run(code, device, callback, num) })

;(async () => {
    const assetsPath = await common.getAssetsPath()
    log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s} {text}'
    log.transports.console.level = 'warn'
    log.transports.file.resolvePath = () => path.join(assetsPath, 'log/main.log')
    Object.assign(console, log.functions)
    log.catchErrors()
})()
