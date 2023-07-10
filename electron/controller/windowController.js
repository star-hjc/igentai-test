const path = require('path')
const { createWorker } = require('tesseract.js')
const { ipcMain, BrowserWindow } = require('electron')
const { assetsPath } = require('../main/config')
const createWindow = require('../main/createMainWindow')
const Store = require('electron-store')
const store = new Store()

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
        const preload = path.join(__dirname, '../preload/workBenchesPreload.js')
        const workWin = createWindow({ data, preload, option, routerPath: 'work', isMax: true, type: 'WorkBenches' }, async () => {
            await worker.terminate()
        })
        workWin.setTitle('工作台')
        workWin.webContents.openDevTools()
    })
}

function createCPUWindow () {
    ipcMain.handle('on-createCPUWindow-event', (event, data = {}, option = {}) => {
        const preload = path.join(__dirname, '../preload/workBenchesPreload.js')
        createWindow({ data, preload, option, routerPath: 'cpu', isMax: true, type: 'CPU' })
    })
}

/** 打开运行案例窗口 */
function createRunCaseWindow () {
    ipcMain.handle('on-createRunCaseWindow-event', async (event, data = {}, option = {}) => {
        await initAddLanguage()
        const preload = path.join(__dirname, '../preload/runCasePreload.js')
        createWindow({ data, preload, option, routerPath: 'run', type: 'RunCase' }, async () => {
            await worker.terminate()
        })
    })
}

/** 打开设备屏幕窗口 */
function createGetScreenWindow () {
    ipcMain.handle('on-createGetScreenWindow-event', (event, data = {}, option = {}) => {
        const win = store.get('win').find(v => v.type === 'GetScreen')
        if (win?.id) {
            BrowserWindow.fromId(win.id).focus()
            return
        }
        const preload = path.join(__dirname, '../preload/screenPreload.js')
        createWindow({
            data, preload, option, routerPath: 'screen', type: 'GetScreen'
        })
        return true
    })
}

/** 打开设备屏幕窗口 */
function createUiNodeWindow () {
    ipcMain.handle('on-createUiNodeWindow-event', (event, data = {}, option = {}) => {
        const win = store.get('win').find(v => v.type === 'UiNode')
        if (win?.id) {
            BrowserWindow.fromId(win.id).focus()
            return
        }
        const preload = path.join(__dirname, '../preload/screenPreload.js')
        createWindow({
            data,
            preload,
            option: {
                width: 960,
                height: 740
            },
            routerPath: 'node',
            type: 'UiNode'
        })
        return true
    })
}

/** 打开设备屏幕窗口 */
function createLogWindow () {
    ipcMain.handle('on-createLogWindow-event', (event, data = {}, option = {}) => {
        const win = store.get('win').find(v => v.type === 'Log')
        if (win?.id) {
            BrowserWindow.fromId(win.id).focus()
            return
        }
        const preload = path.join(__dirname, '../preload/screenPreload.js')
        createWindow({
            data,
            preload,
            option: {
                width: 960,
                height: 740
            },
            routerPath: 'log',
            type: 'Log'
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
        const win = store.get('win').find(v => v.type === 'GetScreen')
        if (win?.id) {
            const webContents = BrowserWindow.fromId(win.id)
            webContents.focus()
            webContents.send('call-onNodeClick-event', data)
            return
        }
    })
}

function onRefreshScreenshot () {
    ipcMain.handle('on-onRefreshScreenshot-event', (event, data = {}) => {
        const win = store.get('win').find(v => v.type === 'UiNode')
        if (win?.id) {
            const webContents = BrowserWindow.fromId(win.id)
            webContents.focus()
            webContents.send('call-onRefreshScreenshot-event', data)
            return
        }
    })
}
