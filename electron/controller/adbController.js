
const { ipcMain } = require('electron')
const adb = require('../utils/adb')
const request = require('../utils/request')

module.exports = {
    getDevices,
    getWiFiIP,
    getScreenInfo,
    killServer,
    startATXService,
    pushFile,
    switchWiFiADB,
    getAtxVersion,
    getScreenshot,
    getPackagesList,
    getDevicePathFileInfo,
    getInitNotExistFile,
    installInitExistFile
}

/** ADB ||-------------- */

/** 获取设备信息  */
async function getDevices () {
    ipcMain.handle('on-getDevicesADB-event', async (event) => {
        return await adb.getDevices()
    })
}

/** 停止ADB服务 */
async function killServer () {
    ipcMain.handle('on-killServer-event', async (event) => {
        await adb.killServer()
    })
}

/** 切换WiFiADB */
async function switchWiFiADB () {
    ipcMain.handle('on-switchWiFiADB-event', async (event, device, host) => {
        return await adb.switchWiFiADB(device, host)
    })
}

/**  上传文件 */
async function pushFile () {
    ipcMain.handle('on-pushFile-event', async (event, device, localPath, toPath) => {
        return await adb.pushFile(device, localPath, toPath)
    })
}

/** 添加缺失文件 */
async function installInitExistFile () {
    ipcMain.handle('on-installInitExistFile-event', async (event, device, initNotExistFile) => {
        await adb.installInitExistFile(device, initNotExistFile)
    })
}

/** 启动atx服务 */
async function startATXService () {
    ipcMain.handle('on-startATXService-event', async (event, device) => {
        return await adb.startATXService(device)
    })
}

/** ADB ||-------------- */

/** 获取wifi端口wifi */
async function getWiFiIP () {
    ipcMain.handle('on-getWiFiIP-event', async (event, device) => {
        return await adb.getWiFiIP(device)
    })
}

/** 获取屏幕信息 */
async function getScreenInfo () {
    ipcMain.handle('on-getScreenInfo-event', async (event, device) => {
        return await adb.getScreenInfo(device)
    })
}

/** 获取包信息 */
async function getPackagesList () {
    ipcMain.handle('on-getPackagesList-event', async (event, device) => {
        return await adb.getPackagesList(device)
    })
}

/** 获取指定文件夹信息 */
async function getDevicePathFileInfo () {
    ipcMain.handle('on-getDevicePathFileInfo-event', async (event, device, filePath) => {
        return await adb.getDevicePathFileInfo(device, filePath)
    })
}

/** 获取初始化未安装的文件 */
async function getInitNotExistFile () {
    ipcMain.handle('on-getInitNotExistFile-event', async (event, device) => {
        return await adb.getInitNotExistFile(device)
    })
}

/** 获取atx版本 */
async function getAtxVersion () {
    ipcMain.handle('on-getAtxVersion-event', async (event, device) => {
        if (!device?.port) return
        return await request.get(`http://127.0.0.1:${device.port}/version`)
    })
}

/** 获取atx版本 */
async function getScreenshot () {
    ipcMain.handle('on-getScreenshot-event', async (event, device) => {
        if (!device?.port) return
        const arraybufferData = await request(`http://127.0.0.1:${device.port}/screenshot`, { responseType: 'arraybuffer' })
        return `data:image/png;base64,${arraybufferData ? Buffer.from(arraybufferData, 'binary').toString('base64') : '11'}`
    })
}
