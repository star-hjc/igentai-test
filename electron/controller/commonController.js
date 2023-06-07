const path = require('path')
const Jimp = require('jimp')
const { SerialPort } = require('serialport')
const { ipcMain, BrowserWindow, shell } = require('electron')
const { exec } = require('../utils/command')
const { assetsPath } = require('../main/config')
const request = require('../utils/request')

const {
    isDirectorySync,
    readdirAllSync,
    renameFileSync,
    createFileSync,
    createFolderSync,
    removeFileSync,
    readFileSync,
    writeFileSync,
    openFileExplorerSync
} = require('../utils/file')

module.exports = {
    isDirectory,
    renameFile,
    devTool,
    cropImg,
    readFile,
    setTitle,
    writeFile,
    createFile,
    readdirCase,
    readdirLog,
    openBrowser,
    removeFile,
    getIpInfo,
    getLocalIPv4,
    createFolder,
    getAssetsPath,
    killServerByPname,
    getSerialPortList,
    switchDevtools,
    openFileExplorer
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

/**
 * 开发者模式
 */
function devTool () {
    ipcMain.handle('on-devTool-event', (event, isOpen) => {
        const webContents = BrowserWindow.fromWebContents(event.sender).webContents
        if (isOpen) return webContents.openDevTools()
        webContents.closeDevTools()
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
        return caseMap(readdirAllSync(basePath))
    })
}

function caseMap (arr) {
    return arr.map((v) => {
        if (v.children?.length) {
            return { ...v, children: caseMap(v.children) }
        }
        return {
            ...v,
            title: v.title.match(/^(.*)\.case$/)?.[1] || v.title
        }
    })
}

/** 读取日志文件 */
function readdirLog () {
    ipcMain.handle('on-readdirLog-event', (event) => {
        const basePath = path.join(assetsPath, 'log')
        return readdirAllSync(basePath)
    })
}

/** 判断为文件夹 */
function isDirectory () {
    ipcMain.handle('on-isDirectory-event', (event, filePath) => {
        return isDirectorySync(filePath)
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

/** 获取本机IPv4地址 */
function getLocalIPv4 () {
    ipcMain.handle('on-getLocalIPv4-event', async (event) => {
        const ipStr = await exec('ipconfig | findstr IPv4') || ''
        if (!ipStr) return []
        return ipStr.trim()?.split('\n')?.map(v => v.split(':')[1]) || []
    })
}

/** 获取本机网络根ip信息 */
function getIpInfo () {
    ipcMain.handle('on-getIpInfo-event', async (event) => {
        return (await request.get('https://www.cz88.net/api/cz88/ip/base?ip='))?.data
    })
}

/** 根据进程名称停止服务 默认获取adb.exe */
function killServerByPname () {
    ipcMain.handle('on-killServerByPname-event', async (event, pName = 'adb.exe') => {
        const pidStr = await exec(`tasklist  | findstr /i "${pName}"`) || ''
        if (!pidStr) return []
        const pids = pidStr.trim()?.split('\n')?.map(v => `/pid ${v.split(/\s+/)[1]}`) || []
        await exec(`taskkill ${pids.join(' ')} /f`)
        return pids
    })
}

/** 移动或重命名文件 */
function renameFile () {
    ipcMain.handle('on-renameFile-event', (event, filePath, fileNameOrNewPath, move) => {
        renameFileSync(filePath, fileNameOrNewPath, move)
    })
}

/** 读取文件文件 */
function readFile () {
    ipcMain.handle('on-readFile-event', async (event, filePath) => {
        return await readFileSync(filePath)
    })
}

/** 写入文件 */
function writeFile () {
    ipcMain.handle('on-writeFile-event', (event, filePath, data, cover) => {
        return writeFileSync(filePath, data, cover)
    })
}

/** 获取串口 */
function getSerialPortList () {
    ipcMain.handle('on-getSerialPortList-event', async (event) => {
        return SerialPort.list()
    })
}

function cropImg () {
    ipcMain.handle('on-cropImg-event', (event, imgBase64, args = []) => {
        return new Promise(async (resolve, reject) => {
            Jimp.read(Buffer.from(imgBase64.split(';base64,').pop(), 'base64')).then(image => {
                resolve(image.crop(...args).getBase64Async(Jimp.MIME_PNG))
            }).catch(() => {
                reject()
            })
        }).catch(() => {})
    })
}
