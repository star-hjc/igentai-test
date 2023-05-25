const { BrowserWindow } = require('electron')
const path = require('path')
const { loadURL } = require('./config.js')

let win = null
module.exports = function createWindow () {
    win = new BrowserWindow({
        /** 隐藏菜单 */
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, '../preload/mainPreload.js'),
            nodeIntegration: true
        }
    })
    win.id = 'main-win'
    /** 最大化 */
    win.maximize()
    win.setTitle('IGENTAI-TEST')
    /** 开发者工具 */
    // win.webContents.openDevTools()
    win.loadURL(loadURL)
    win.setAppDetails({
        appId: 'com.star.igentai-test.main'
    })
}

global.mainWindow = win
