const { contextBridge, ipcRenderer } = require('electron')
const common = require('./modules/common')
const adbApi = require('./modules/adb')
const view = require('./modules/window')
const adb = {}

contextBridge.exposeInMainWorld('appApi', {
    ...common,
    ipcRenderer: { ...ipcRenderer, on: ipcRenderer.on.bind(ipcRenderer) }
})

contextBridge.exposeInMainWorld('adb', {
    ...adbApi
})

contextBridge.exposeInMainWorld('view', {
    ...view
})

contextBridge.exposeInMainWorld('deviceCase', {
    run: async (code, device = {}) => {
        for (const key in adbApi) {
            adb[key] = adbApi[key].bind(this, device)
        }

        return new Promise(async (resolve, reject) => {
            // eslint-disable-next-line no-eval
            const codeData = await eval(`(async()=>{${code}})()`)
                .then(res => {
                    resolve(true)
                })
                .catch(err => {
                    // eslint-disable-next-line no-console
                    console.error(err)
                })
            console.log(codeData)
        }).catch(err => {
            console.log(1231)
            console.log(err)
        })
    }
})
