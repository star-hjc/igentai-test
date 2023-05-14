
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
    getUI,
    switchWiFiADB,
    getAtxVersion,
    getScreenshot,
    getPackagesList,
    getDevicePathFileInfo,
    getInitNotExistFile,
    installInitExistFile,
    tap,
    longpress,
    swipe,
    multitouch,
    input,
    startApp,
    keyevent,
    getRunAppisActivity
}

/** ADB ||-------------- */

/** 获取设备信息  */
async function getDevices() {
    ipcMain.handle('on-getDevicesADB-event', async (event) => {
        return await adb.getDevices()
    })
}

/** 停止ADB服务 */
async function killServer() {
    ipcMain.handle('on-killServer-event', async (event) => {
        await adb.killServer()
    })
}

/** 切换WiFiADB */
async function switchWiFiADB() {
    ipcMain.handle('on-switchWiFiADB-event', async (event, device, host) => {
        return await adb.switchWiFiADB(device, host)
    })
}

/**  上传文件 */
async function pushFile() {
    ipcMain.handle('on-pushFile-event', async (event, device, localPath, toPath) => {
        return await adb.pushFile(device, localPath, toPath)
    })
}

/** 添加缺失文件 */
async function installInitExistFile() {
    ipcMain.handle('on-installInitExistFile-event', async (event, device, initNotExistFile) => {
        return await adb.installInitExistFile(device, initNotExistFile)
    })
}

/** 启动atx服务 */
async function startATXService() {
    ipcMain.handle('on-startATXService-event', async (event, device) => {
        return await adb.startATXService(device)
    })
}

/** ADB ||-------------- */

/** 获取wifi端口wifi */
async function getWiFiIP() {
    ipcMain.handle('on-getWiFiIP-event', async (event, device) => {
        return await adb.getWiFiIP(device)
    })
}

/** 获取屏幕信息 */
async function getScreenInfo() {
    ipcMain.handle('on-getScreenInfo-event', async (event, device) => {
        return await adb.getScreenInfo(device)
    })
}

/** 获取包信息 */
async function getPackagesList() {
    ipcMain.handle('on-getPackagesList-event', async (event, device) => {
        return await adb.getPackagesList(device)
    })
}

/** 获取指定文件夹信息 */
async function getDevicePathFileInfo() {
    ipcMain.handle('on-getDevicePathFileInfo-event', async (event, device, filePath) => {
        return await adb.getDevicePathFileInfo(device, filePath)
    })
}

/** 获取初始化未安装的文件 */
async function getInitNotExistFile() {
    ipcMain.handle('on-getInitNotExistFile-event', async (event, device) => {
        return await adb.getInitNotExistFile(device)
    })
}

/** 获取atx版本 */
async function getAtxVersion() {
    ipcMain.handle('on-getAtxVersion-event', async (event, device) => {
        if (!device?.port) return
        return await request.get(`${adb.atxHost(device.port, device.ip)}/version`)
    })
}

/** 获取设备截图 */
async function getScreenshot() {
    ipcMain.handle('on-getScreenshot-event', async (event, device) => {
        return await adb.getScreenshot(device)
    })
}

/** 获取XML-UI */
async function getUI() {
    ipcMain.handle('on-getUI-event', async (event, device, all) => {
        return await adb.getUI(device, all)
    })
}

/** 点击触屏事件 */
async function tap() {
    ipcMain.handle('on-tap-event', (event, device, x, y) => {
        return adb.tap(device, x, y)
    })
}

/** 拖动触屏事件 */
function swipe() {
    ipcMain.handle('on-swipe-event', (event, device, x, y, toX, toY, tiem) => {
        return adb.swipe(device, x, y, toX, toY, tiem)
    })
}

/** 长按 */
function longpress() {
    ipcMain.handle('on-longpress-event', (event, device, x, y, tiem) => {
        return adb.swipe(device, x, y, x, y, tiem)
    })
}

/** 手机按键 */
function keyevent() {
    ipcMain.handle('on-keyevent-event', (event, device, keycode) => {
        return adb.keyevent(device, keycode)
    })
}

/** 多指 */
function multitouch() {
    ipcMain.handle('on-multitouch-event', (event, device, touch) => {
        return adb.multitouch(device, touch)
    })
}

/** 根据<package_name/activity_name>启动APP  */
function startApp() {
    ipcMain.handle('on-startApp-event', (event, device, name) => {
        return adb.startApp(device, name)
    })
}

/** 获取运行在窗口的软件的Activity */
async function getRunAppisActivity() {
    ipcMain.handle('on-getRunAppisActivity-event', (event, device) => {
        return adb.getRunAppisActivity(device)
    })
}

/** 文本输入事件  */
async function input() {
    ipcMain.handle('on-input-event', async (event, device) => {
        return await adb.input(device)
    })
}
