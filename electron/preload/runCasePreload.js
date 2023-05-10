const { contextBridge } = require('electron')
const common = require('./modules/common')
const adb = require('./modules/adb')
const view = require('./modules/window')

contextBridge.exposeInMainWorld('appApi', {
    ...common
})

contextBridge.exposeInMainWorld('adb', {
    ...adb
})

contextBridge.exposeInMainWorld('view', {
    ...view
})

contextBridge.exposeInMainWorld('deviceCase', {
    run: async (code) => {
        return new Promise((resolve, reject) => {
            try {
                // eslint-disable-next-line no-eval
                eval(`(async()=>{${code}})()`).then(res => {
                    resolve(true)
                })
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err)
                reject(false)
            }
        })
    }
})
