const path = require('path')
const { SerialPort } = require('serialport')
const querystring = require('querystring')
const { ipcMain, BrowserWindow, shell } = require('electron')
const { loadURL, assetsPath } = require('../main/config')
const { readdirAllSync, renameFileSync, createFileSync, createFolderSync, removeFileSync, openFileExplorerSync } = require('../utils/flie.js')

module.exports = {
    renameFile,
    setTitle,
    createFile,
    readdirCase,
    openBrowser,
    removeFile,
    createFolder,
    getAssetsPath,
    getSerialPortList,
    switchDevtools,
    openFileExplorer,
    createRunCaseWindow,
    createWorkBenchesWindow
}

/**
 * 设置窗口标题
 */
function setTitle () {
    ipcMain.handle('on-setTitle-event', (event, title) => {
        /** 获取当前页面标题 */
        const win = BrowserWindow.fromWebContents(event.sender)
        win.setTitle(title)
    })
}

/** 使用系统默认浏览器打开 URL */
function openBrowser () {
    ipcMain.handle('on-openBrowser-event', (event, url) => {
        shell.openExternal(url)
    })
}

/** 读取脚本文件 */
function readdirCase () {
    ipcMain.handle('on-readdirCase-event', (event) => {
        const basePath = path.join(assetsPath, 'case')
        return readdirAllSync(basePath)
    })
}

/** 创建文件 */
function createFile () {
    ipcMain.handle('on-createFile-event', (event, filePath, fileName, content, cover) => {
        createFileSync(filePath, fileName, content, cover)
    })
}

/** 创建文件夹 */
function createFolder () {
    ipcMain.handle('on-createFolder-event', (event, filePath, folderName) => {
        createFolderSync(filePath, folderName)
    })
}

/** 删除文件、文件夹 */
function removeFile () {
    ipcMain.handle('on-removeFile-event', (event, filePath, recursive) => {
        removeFileSync(filePath, recursive)
    })
}

/** 切换开发者模式 */
function switchDevtools () {
    ipcMain.handle('on-switchDevtools-event', (event) => {
        event.sender.toggleDevTools()
    })
}

/** 获取静态地址 */
function getAssetsPath () {
    ipcMain.handle('on-getAssetsPath-event', (event, suffixPath = '') => {
        return path.join(assetsPath, suffixPath)
    })
}

/** 打开文件资源管理器 */
function openFileExplorer () {
    ipcMain.handle('on-openFileExplorer-event', async (event, filePath = '') => {
        return await openFileExplorerSync(filePath)
    })
}

/** 移动或重命名文件 */
function renameFile () {
    ipcMain.handle('on-renameFile-event', (event, filePath, fileNameOrNewPath, move) => {
        renameFileSync(filePath, fileNameOrNewPath, move)
    })
}
/** 获取串口 */
function getSerialPortList () {
    ipcMain.handle('on-getSerialPortList-event', async (event) => {
        return SerialPort.list()
    })
}

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
        workWin.webContents.openDevTools()
    })
}

/** 打开运行案例窗口 */
function createRunCaseWindow () {
    ipcMain.handle('on-createRunCaseWindow-event', (event, data = {}, option = {}) => {
        const workWin = new BrowserWindow({
            autoHideMenuBar: true,
            resizable: true,
            width: 200,
            height: 100,
            webPreferences: {
                preload: path.join(__dirname, '../preload/workBenchesPreload.js'),
                nodeIntegration: true
            },
            ...option
        })
        workWin.loadURL(`${loadURL}#/run?${querystring.stringify(data)}`)
        workWin.webContents.openDevTools()
    })
}
