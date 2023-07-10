const { BrowserWindow } = require('electron')
const Store = require('electron-store')
const path = require('path')
const { loadURL } = require('./config.js')
const querystring = require('querystring')

module.exports = function createWindow (config = {}, onClose) {
    const defaultConfig = { routerPath: '', type: '', option: {}, preload: path.join(__dirname, '../preload/mainPreload.js'), data: {}, isMax: false, isOpenDevTools: false, ...config }
    const { routerPath, data, type, isMax, isOpenDevTools, preload, option } = defaultConfig
    const store = new Store()
    const win = new BrowserWindow({
        /** 隐藏菜单 */
        autoHideMenuBar: true,
        webPreferences: {
            preload,
            nodeIntegration: true
        },
        title: '窗口标题',
        ...option
    })
    /** 最大化 */
    if (isMax) win.maximize()
    /** 开发者工具 */
    if (isOpenDevTools) win.webContents.openDevTools()
    win.loadURL(`${loadURL}/#/${routerPath}?${querystring.stringify(data)}`)
    const wins = store.get('win')
    wins.push({ id: win.id, loadURL, type })
    store.set('win', wins)
    win.on('close', async () => {
        const wins = store.get('win')
        store.set('win', wins.filter(v => v.id !== win.id))
        if (typeof (onClose) === 'function') await onClose()
    })
    return win
}

