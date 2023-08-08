
const path = require('path')
const xml2js = require('xml2js')
const Serial = require('../modules/Serial')
const { env } = require('../main/config')
const { assetsPath } = require('../main/config')
const { shell } = require('./command')
const request = require('./request')
const { delay } = require('./common')

module.exports = {
    atxHost,
    getDevices,
    killServer,
    getWiFiIP,
    starSerialPortService,
    startATXService,
    getInstrumentScreen,
    getScreenInfo,
    getPackagesList,
    getDevicePathFileInfo,
    getInitNotExistFile,
    getScreenshot,
    getUI,
    switchWiFiADB,
    installInitExistFile,
    pushFile,
    tap,
    text,
    swipe,
    multitouch,
    input,
    clearText,
    setText,
    keyevent,
    startApp,
    getRunAppisActivity,
    command
}

function adb (args, deviceId) {
    return shell('adb', [...(deviceId ? ['-s', deviceId] : []), ...args], { cwd: path.join(assetsPath, 'exe') })
}

function command (device, args) {
    if (device.id) {
        return adb(['shell', ...args], device.id)
    }
    return new Serial(device.path, parseInt(device.baudRate || 0)).shell(args)
}

/** 获取设备信息  */
async function getDevices () {
    const { data, success } = await adb(['devices'])
    if (!success) return []
    return data.split('\r\n')?.filter(v => v.indexOf('\t') !== -1)?.map(v => {
        const [device_id, device] = v.split('\t')
        return { device_id, device }
    })
}

/** 停止ADB服务 */
async function killServer () {
    await adb(['killServer'])
}

/**
 * 上传文件
 * @param {String} localPath 本地文件
 * @param {*} toPath 上传文件位置
 * @returns {Boolean}
 */
async function pushFile (device, localPath, toPath = '/data/local/tmp/') {
    if (localPath) return
    const { success } = await adb(['push', localPath, toPath], device.id)
    return success
}

/** 切换WiFiADB */
async function switchWiFiADB (device, host) {
    if (!device.id) return
    const { success: tcpip } = await adb(['tcpip', host.split(':')[1]], device.id)
    if (!tcpip) return
    const { success: connect } = await adb(['connect', host], device.id)
    return tcpip && connect
}

async function starSerialPortService (device) {
    await command(device, ['su'])
    await command(device, ['chmod', '755', '/data/local/tmp/atx-agent'])
    await command(device, ['chmod', '755', '/data/local/tmp/minicap'])
    await command(device, ['chmod', '755', '/data/local/tmp/minicap.so'])
    await command(device, ['chmod', '755', '/data/local/tmp/minicap-nopie'])
    await command(device, ['chmod', '755', '/data/local/tmp/ui.xml'])
    await command(device, ['/data/local/tmp/atx-agent', 'server -d'])
}

/** 启动atx服务 */
async function startATXService (device) {
    if (!device?.port || !device.id) return
    await adb(['shell', 'chmod', '755', '/data/local/tmp/atx-agent'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/minicap'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/minicap.so'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/minicap-nopie'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/ui.xml'], device.id)
    await adb(['shell', '/data/local/tmp/atx-agent', 'server -d'], device.id)
    await adb(['forward', `tcp:${device.port}`, 'tcp:7912'], device.id)
    const { success } = await adb(['forward', `tcp:${device.port}`, 'tcp:7912'], device.id)
    await delay()
    return success
}

/** 获取wifi端口wifi */
async function getWiFiIP (device) {
    const { data, success } = await command(device, ['ifconfig', 'wlan0', '|', 'grep', `"inet addr"`])
    if (!success) return
    return data?.trim()?.split(/\s\s+/)?.reduce((a, b) => {
        const item = b.replace(/\s*/g, '').split(':')
        a[item[0]] = item[1]
        return a
    }, {})
}

/** 获取屏幕信息 */
async function getScreenInfo (device) {
    let width, height, DPI
    await command(device, ['wm', 'size']).then(({ data, success }) => {
        if (success) {
            [width, height] = data.split(': ')?.[1]?.split('x') || []
        }
    })
    await command(device, ['wm', 'density']).then(({ data, success }) => {
        if (success) {
            DPI = data.split(': ')?.[1]
        }
    })
    return { width: width && Number(width), height: height && Number(height), DPI: DPI && Number(DPI) }
}

async function getInstrumentScreen (device) {
    const { success } = await command(device, ['dumpsys', 'AutoService', 'Dashboard_Screenshots', '1'])
    let base64Data = ''
    if (success) {
        await delay(5000)
        const { data: fileList, success: lsSuccess } = await command(device, ['ls', '/cache/Screenshots/'])
        if (lsSuccess) {
            await command(device, ['base64', '/cache/Screenshots/' + fileList.split('\\n')?.[0]?.trim() || '']).then(({ data, success: getBas64 }) => {
                if (getBas64)base64Data = data
            })
        }
    }
    return `data:image/png;base64,${base64Data}`
}

/** 获取所有安装包 */
async function getPackagesList (device) {
    const { data, success } = await command(device, ['pm', 'list', 'packages'])
    if (!success) return []
    return data.trim().split('\n').map(v => v.trim().split(':')[1]).filter(v => v !== undefined)
}

/** 获取文件夹信息 */
async function getDevicePathFileInfo (device, filePath = '/data/local/tmp/') {
    if (!/\/\s*$/.test(filePath)) return
    const { data, success } = await command(device, ['ls', filePath])
    if (!success) return []
    return data.trim().split('\n').map(v => v.trim()).filter(v => v !== undefined)
}

/** 获取初始化未安装成功的文件 */
async function getInitNotExistFile (device) {
    const packages = await getPackagesList(device)
    const files = await getDevicePathFileInfo(device)
    const notPackages = env.packages.filter(v => packages?.indexOf(v.package) === -1)
    const notFiles = env.files.filter(v => files?.indexOf(v.name) === -1)
    return { packages: notPackages.map(v => v.name), files: notFiles.map(v => v.name) }
}

/** 安装未安装的初始化文件 */
async function installInitExistFile (device, initNotExistFile = { packages: [], files: [] }) {
    const { packages, files } = initNotExistFile
    for (const item of packages) {
        const { path } = env.packages.find(v => v.name === item) || {}
        await adb(['install', path], device.id)
    }
    for (const item of files) {
        const { path } = env.files.find(v => v.name === item) || {}
        await adb(['push', path, '/data/local/tmp/'], device.id)
    }
    return await getInitNotExistFile(device)
}

function atxHost (port = '6666', ip) {
    return `http://${ip || '127.0.0.1'}:${port}`
}

/** 获取设备截图 */
async function getScreenshot (device) {
    if (device.id && device?.port) {
        const arraybufferData = await request(`${atxHost(device.port, device.ip)}/screenshot`, { responseType: 'arraybuffer' })
        if (arraybufferData) {
            return `data:image/png;base64,${arraybufferData ? Buffer.from(arraybufferData, 'binary').toString('base64') : ''}`
        }
    }
    if (device.id || device.path) {
        const { data, success } = await command(device, ['screencap', '-p', '|', 'base64'])
        if (!success) return `data:image/png;base64,`
        return `data:image/png;base64,${data}`
    }
}

/** 获取XML-UI */
async function getUI (device, all = false) {
    if (device.id && device?.port) {
        const data = await request(`${atxHost(device.port, device.ip)}/dump/hierarchy`)
        if (data) {
            const result = data?.result || ''
            if (!all) return result
            return [await xml2js.parseStringPromise(result), result]
        }
    }
    if (device.id || device.path) {
        const { data, success } = await command(device, ['uiautomator', 'dump', '/sdcard/ui.xml', '&&', 'cat', '/sdcard/ui.xml'])
        if (!success) return
        let result = data.split('\n')
        result.shift()
        result = result.join('\n')
        if (!all) return result
        return [await xml2js.parseStringPromise(result), result]
    }
}

/** 点击触屏事件  */
function tap (device, x, y) {
    return command(device, ['input', 'tap', `${x}`, `${y}`])
}

/** 拖动触屏事件 */
function swipe (device, x = 0, y = 0, toX, toY, tiem) {
    return command(device, ['input', 'swipe', `${x}`, `${y}`, `${toX}`, `${toY}`, `${tiem}`])
}

/** 多指 */
function multitouch (device, touch) {
    return command(device, ['input', 'touchscreen', 'multitouch', `${touch}`])
}

/** 根据<package_name/activity_name>启动APP  */
function startApp (device, name) {
    return command(device, ['am', 'start', '-n', `${name}`])
}

/** 获取运行在窗口的软件的Activity */
async function getRunAppisActivity (device) {
    const { data, success } = await command(device, ['dumpsys', 'activity', 'top', '|', 'grep', '"ACTIVITY"'])
    if (success) {
        return data.trim()?.split('\r\n')?.map(v => v?.trim()?.split(/\s+/))?.map(a => a?.[1])?.reverse()
    }
    return data
}

/** 手机按键 */
async function keyevent (device, keycode) {
    return command(device, ['input', 'keyevent', `${keycode}`])
}

/** 文本输入事件  */
async function input (device, content) {
    const { data: keyName, success } = await command(device, ['settings', 'get', 'secure', 'default_input_method'])
    if (!success) return
    await command(device, ['settings', 'put', 'secure', 'default_input_method', 'com.android.adbkeyboard/.AdbIME'])
    await delay(800)
    const data = await command(device, ['am', 'broadcast', '-a', 'ADB_INPUT_TEXT', '--es', 'msg', content])
    await command(device, ['settings', 'put', 'secure', 'default_input_method', keyName.trim()])
    return data
}

async function text (device, content) {
    return command(device, ['input', 'text', `${content}`])
}

/** 文本输入事件  */
async function clearText (device) {
    const { data: keyName, success } = await command(device, ['settings', 'get', 'secure', 'default_input_method'])
    if (!success) return
    await command(device, ['settings', 'put', 'secure', 'default_input_method', 'com.android.adbkeyboard/.AdbIME'])
    await delay(800)
    const data = await command(device, ['am', 'broadcast', '-a', 'ADB_CLEAR_TEXT'])
    await command(device, ['settings', 'put', 'secure', 'default_input_method', keyName.trim()])
    return data
}

async function setText (device, content) {
    const { data: keyName, success } = await command(device, ['settings', 'get', 'secure', 'default_input_method'])
    if (!success) return
    await command(device, ['settings', 'put', 'secure', 'default_input_method', 'com.android.adbkeyboard/.AdbIME'])
    await delay(800)
    const data = await command(device, ['am', 'broadcast', '-a', 'ADB_SET_TEXT', '--es', 'msg', content])
    await command(device, ['settings', 'put', 'secure', 'default_input_method', keyName.trim()])
    return data
}
