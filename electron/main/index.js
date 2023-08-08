const { app, BrowserWindow } = require('electron')
const createMainWindow = require('./createMainWindow')
const initController = require('../controller')
const Store = require('electron-store')
Store.initRenderer()

const store = new Store()
store.delete('win')
store.set('win', [])
app.whenReady().then(async () => {
    createMainWindow({ isMax: true, type: 'main' })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow({ isMax: true })
    })
    /** 监听事件注册 */
    initController()
})

app.on('window-all-closed', function (event) {
    if (process.platform !== 'darwin') app.quit()
})

console.log('process.versions.modules', process.versions.modules)
console.log('process.versions.node', process.versions.node)
