const { app, BrowserWindow } = require('electron')
const createMainWindow = require('./createMainWindow')
const initController = require('../controller')

app.whenReady().then(async () => {
    createMainWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
    /** 监听事件注册 */
    initController()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

