const path = require('path')
const { createWorker } = require('tesseract.js')
const querystring = require('querystring')
const { ipcMain, BrowserWindow } = require('electron')
const { loadURL, assetsPath } = require('../main/config')

module.exports = {
    createRunCaseWindow,
    createGetScreenWindow,
    createWorkBenchesWindow,
    createUiNodeWindow,
    createCPUWindow,
    createLogWindow,
    getAppInfo,
    onNodeClick,
    onRefreshScreenshot,
    ocr
}

let screenWin = null
let uiNodeWin = null
let logWin = null
let worker = null

async function initAddLanguage (lang = ['eng', 'rus', 'chi_sim', 'chi_tra', 'spa', 'ara', 'fas', 'deu', 'kor']) {
    worker = await createWorker({
        langPath: path.join(assetsPath, '/ocr-lang/'),
        gzip: false
    })
    await worker.loadLanguage(lang)
}

async function ocr () {
    ipcMain.handle('on-ocr-event', async (event, file, options = {}) => {
        await worker.initialize(options.lang || 'eng')
        if (options.range && options.range?.length === 4) {
            options.range = { left: options.range[0], top: options.range[1], width: options.range[2], height: options.range[3] }
        } else {
            options.range = undefined
        }
        const { data } = await worker.recognize(file, {
            rectangle: options.range
        })
        return data?.text
    })
}

/** 打开代码编辑工作台 */
function createWorkBenchesWindow () {
    ipcMain.handle('on-createWorkBenchesWindow-event', async (event, data = {}, option = {}) => {
        await initAddLanguage()
        const workWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            webPreferences: {
                preload: path.join(__dirname, '../preload/workBenchesPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        workWin.on('close', async (event) => {
            await worker.terminate()
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
    })
}

/** 打开运行案例窗口 */
function createRunCaseWindow () {
    ipcMain.handle('on-createRunCaseWindow-event', async (event, data = {}, option = {}) => {
        await initAddLanguage()
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
        runWin.on('close', async (event) => {
            await worker.terminate()
        })
        runWin.loadURL(`${loadURL}#/run?${querystring.stringify(data)}`)
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

/** 打开设备屏幕窗口 */
function createLogWindow () {
    ipcMain.handle('on-createLogWindow-event', (event, data = {}, option = {}) => {
        if (logWin !== null) {
            logWin.focus()
            return
        }
        logWin = new BrowserWindow({
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
        logWin.loadURL(`${loadURL}#/log?${querystring.stringify(data)}`)
        // uiNodeWin.webContents.openDevTools()
        logWin.on('closed', () => {
            logWin = null
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
