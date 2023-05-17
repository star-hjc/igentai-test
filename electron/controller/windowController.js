const path = require('path')
const querystring = require('querystring')
const { ipcMain, BrowserWindow } = require('electron')
const { loadURL } = require('../main/config')

module.exports = {
    createRunCaseWindow,
    createGetScreenWindow,
    createWorkBenchesWindow,
    createUiNodeWindow,
    createCPUWindow,
    getAppInfo,
    onNodeClick,
    onRefreshScreenshot
}

let screenWin = null
let uiNodeWin = null

/** 打开代码编辑工作台 */
function createWorkBenchesWindow () {
    ipcMain.handle('on-createWorkBenchesWindow-event', (event, data = {}, option = {}) => {
        const workWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, '../preload/workBenchesPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        /** 最大化 */
        workWin.maximize()
        workWin.loadURL(`${loadURL}#/work?${querystring.stringify(data)}`)
        workWin.setTitle('工作台')
        workWin.webContents.openDevTools()
    })
}

function createCPUWindow () {
    ipcMain.handle('on-createCPUWindow-event', (event, data = {}, option = {}) => {
        const workWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, '../preload/workBenchesPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        /** 最大化 */
        workWin.maximize()
        workWin.loadURL(`${loadURL}#/cpu?${querystring.stringify(data)}`)
        workWin.setTitle('监控')
        workWin.webContents.openDevTools()
    })
}

/** 打开运行案例窗口 */
function createRunCaseWindow () {
    ipcMain.handle('on-createRunCaseWindow-event', (event, data = {}, option = {}) => {
        const runWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            width: 450,
            height: 300,
            webPreferences: {
                preload: path.join(__dirname, '../preload/runCasePreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        runWin.loadURL(`${loadURL}#/run?${querystring.stringify(data)}`)
        runWin.webContents.openDevTools()
    })
}

/** 打开设备屏幕窗口 */
function createGetScreenWindow () {
    ipcMain.handle('on-createGetScreenWindow-event', (event, data = {}, option = {}) => {
        if (screenWin !== null) {
            screenWin.focus()
            return
        }
        screenWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            width: 960,
            height: 640,
            webPreferences: {
                preload: path.join(__dirname, '../preload/screenPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        screenWin.loadURL(`${loadURL}#/screen?${querystring.stringify(data)}`)
        // screenWin.webContents.openDevTools()
        screenWin.on('closed', () => {
            screenWin = null
        })
        return true
    })
}

/** 打开设备屏幕窗口 */
function createUiNodeWindow () {
    ipcMain.handle('on-createUiNodeWindow-event', (event, data = {}, option = {}) => {
        if (uiNodeWin !== null) {
            uiNodeWin.focus()
            return
        }
        uiNodeWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            width: 960,
            height: 740,
            webPreferences: {
                preload: path.join(__dirname, '../preload/screenPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        uiNodeWin.loadURL(`${loadURL}#/node?${querystring.stringify(data)}`)
        // uiNodeWin.webContents.openDevTools()
        uiNodeWin.on('closed', () => {
            uiNodeWin = null
        })
        return true
    })
}

function getAppInfo () {
    ipcMain.handle('on-getAppInfo-event', (event, data = {}, option = {}) => {
        const windows = BrowserWindow.getAllWindows()
        return windows.map(v => { return { id: v.id } })
    })
}

function onNodeClick () {
    ipcMain.handle('on-onNodeClick-event', (event, data = {}) => {
        if (!screenWin) return
        screenWin.focus()
        screenWin.webContents.send('call-onNodeClick-event', data)
    })
}

function onRefreshScreenshot () {
    ipcMain.handle('on-onRefreshScreenshot-event', (event, data = {}) => {
        if (!uiNodeWin) return
        uiNodeWin.focus()
        uiNodeWin.webContents.send('call-onRefreshScreenshot-event', data)
    })
}
