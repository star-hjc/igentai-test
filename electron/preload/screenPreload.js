const { contextBridge } = require('electron')
const common = require('./modules/common')
const adb = require('./modules/adb')

contextBridge.exposeInMainWorld('appApi', {
    ...common
})

contextBridge.exposeInMainWorld('adb', {
    ...adb
})
