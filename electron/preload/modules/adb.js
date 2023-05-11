const { ipcRenderer } = require('electron')

module.exports = {
    getDevices,
    getWiFiIP,
    pushFile,
    getUI,
    killServer,
    switchWiFiADB,
    getPackagesList,
    getScreenInfo,
    getScreenshot,
    getAtxVersion,
    startATXService,
    getDevicePathFileInfo,
    getInitNotExistFile,
    installInitExistFile,
    tap,
    longpress,
    swipe,
    multitouch,
    input,
    startApp,
    getRunAppisActivity
}
/** ADB ||------------ */

function getDevices() {
    return ipcRenderer.invoke('on-getDevicesADB-event')
}

async function pushFile(device, localPath, toPath) {
    await ipcRenderer.invoke('on-pushFile-event', device, localPath, toPath)
}

/** 切换WiFiADB */
async function switchWiFiADB(device, host) {
    return ipcRenderer.invoke('on-switchWiFiADB-event', device, host)
}

async function killServer() {
    await ipcRenderer.invoke('on-killServer-event')
}

async function startATXService(device) {
    return await ipcRenderer.invoke('on-startATXService-event', device)
}

/** ADB ||------------ */
async function getWiFiIP(device) {
    return ipcRenderer.invoke('on-getWiFiIP-event', device)
}

async function getPackagesList(device) {
    return ipcRenderer.invoke('on-getPackagesList-event', device)
}

async function getScreenInfo(device) {
    return ipcRenderer.invoke('on-getScreenInfo-event', device)
}

async function getDevicePathFileInfo(device, filePath) {
    return ipcRenderer.invoke('on-getDevicePathFileInfo-event', device, filePath)
}

async function getInitNotExistFile(device) {
    return ipcRenderer.invoke('on-getInitNotExistFile-event', device)
}

async function installInitExistFile(device, initNotExistFile) {
    return ipcRenderer.invoke('on-installInitExistFile-event', device, initNotExistFile)
}

async function getAtxVersion(device) {
    return ipcRenderer.invoke('on-getAtxVersion-event', device)
}

async function getScreenshot(device) {
    return ipcRenderer.invoke('on-getScreenshot-event', device)
}

async function getUI(device, json) {
    return await ipcRenderer.invoke('on-getUI-event', device, json)
}

/** 点击触屏事件 */
async function tap(device, x, y) {
    return ipcRenderer.invoke('on-tap-event', device, x, y)
}

/** 拖动触屏事件 */
function swipe(device, x, y, toX, toY, tiem) {
    return ipcRenderer.invoke('on-swipe-event', device, x, y, toX, toY, tiem)
}

/** 长按 */
function longpress(device, x, y, tiem) {
    return ipcRenderer.invoke('on-longpress-event', device, x, y, tiem)
}
/** 多指 */
function multitouch(device, touch) {
    return ipcRenderer.invoke('on-multitouch-event', device, touch)
}

/** 根据<package_name/activity_name>启动APP  */
async function startApp(device, name) {
    return await ipcRenderer.invoke('on-startApp-event', device, name)
}

/** 获取运行在窗口的软件的Activity */
async function getRunAppisActivity(device) {
    return await ipcRenderer.invoke('on-getRunAppisActivity-event', device)
}

/** 文本输入事件  */
async function input(device) {
    return await ipcRenderer.invoke('on-input-event', device)
}