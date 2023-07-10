const { ipcRenderer } = require('electron')

module.exports = {
    command,
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
    getInstrumentScreen,
    getDevicePathFileInfo,
    getInitNotExistFile,
    installInitExistFile,
    tap,
    longpress,
    swipe,
    multitouch,
    input,
    setText,
    clearText,
    keyevent,
    startApp,
    setUiautomatorServe,
    getRunAppisActivity
}
/** ADB ||------------ */

function getDevices () {
    return ipcRenderer.invoke('on-getDevices-event')
}

async function pushFile (device, localPath, toPath) {
    await ipcRenderer.invoke('on-pushFile-event', device, localPath, toPath)
}

/** 切换WiFiADB */
async function switchWiFiADB (device, host) {
    return ipcRenderer.invoke('on-switchWiFiADB-event', device, host)
}

async function killServer () {
    await ipcRenderer.invoke('on-killServer-event')
}

async function startATXService (device) {
    return await ipcRenderer.invoke('on-startATXService-event', device)
}

async function setUiautomatorServe (device, type) {
    return await ipcRenderer.invoke('on-setUiautomatorServe-event', device, type)
}

/** ADB ||------------ */
async function getWiFiIP (device) {
    return ipcRenderer.invoke('on-getWiFiIP-event', device)
}

async function getInstrumentScreen (device) {
    return ipcRenderer.invoke('on-getInstrumentScreen-event', device)
}

async function getPackagesList (device) {
    return ipcRenderer.invoke('on-getPackagesList-event', device)
}

async function getScreenInfo (device) {
    return ipcRenderer.invoke('on-getScreenInfo-event', device)
}

async function getDevicePathFileInfo (device, filePath) {
    return ipcRenderer.invoke('on-getDevicePathFileInfo-event', device, filePath)
}

async function getInitNotExistFile (device) {
    return ipcRenderer.invoke('on-getInitNotExistFile-event', device)
}

async function installInitExistFile (device, initNotExistFile) {
    return ipcRenderer.invoke('on-installInitExistFile-event', device, initNotExistFile)
}

async function getAtxVersion (device) {
    return ipcRenderer.invoke('on-getAtxVersion-event', device)
}

async function getScreenshot (device) {
    return ipcRenderer.invoke('on-getScreenshot-event', device)
}

async function getUI (device, all) {
    return await ipcRenderer.invoke('on-getUI-event', device, all)
}

/** 点击触屏事件 */
async function tap (device, x, y) {
    if ([x, y].includes(undefined)) return
    return ipcRenderer.invoke('on-tap-event', device, x, y)
}

/** 拖动触屏事件 */
function swipe (device, x, y, toX, toY, tiem = 1000) {
    if ([x, y, toX, toY].includes(undefined)) return
    return ipcRenderer.invoke('on-swipe-event', device, x, y, toX, toY, tiem)
}

/** 长按 */
function longpress (device, x, y, tiem = 1000) {
    if ([x, y].includes(undefined)) return
    return ipcRenderer.invoke('on-longpress-event', device, x, y, tiem)
}
/** 多指 */
function multitouch (device, touch) {
    return ipcRenderer.invoke('on-multitouch-event', device, touch)
}

/** 根据<package_name/activity_name>启动APP  */
async function startApp (device, name) {
    return await ipcRenderer.invoke('on-startApp-event', device, name)
}

/** 获取运行在窗口的软件的Activity */
async function getRunAppisActivity (device) {
    return await ipcRenderer.invoke('on-getRunAppisActivity-event', device)
}

/** 文本输入事件  */
async function keyevent (device, keycode) {
    return await ipcRenderer.invoke('on-keyevent-event', device, keycode)
}

/** 文本输入事件  */
async function input (device, content) {
    return await ipcRenderer.invoke('on-input-event', device, content)
}

/** 文本输入事件  */
async function clearText (device) {
    return await ipcRenderer.invoke('on-clearText-event', device)
}

/** 文本输入事件  */
async function setText (device, content) {
    return await ipcRenderer.invoke('on-setText-event', device, content)
}

async function command (device, args) {
    return await ipcRenderer.invoke('on-command-event', device, args)
}
