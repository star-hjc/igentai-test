
const path = require('path')
const Serial = require('../modules/Serial')
const { shell } = require('../utils/command')
const { assetsPath } = require('../main/config')
const { env } = require('../main/config')

module.exports = {
    getDevices,
    killServer,
    getWiFiIP,
    startATXService,
    getScreenInfo,
    getPackagesList,
    getDevicePathFileInfo,
    getInitNotExistFile,
    switchWiFiADB,
    installInitExistFile,
    pushFile
}

function adb (args, deviceId) {
    return shell('adb', [...(deviceId ? ['-s', deviceId] : []), ...args], { cwd: path.join(assetsPath, 'exe') })
}

function command (device, args) {
    if (device.id) {
        return adb(['shell', ...args], device.id)
    }
    return new Serial(device.path, device.baudRate).shell(args)
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

/** 启动atx服务 */
async function startATXService (device) {
    if (!device?.port || !device.id) return
    await adb(['shell', 'chmod', '755', '/data/local/tmp/atx-agent'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/minicap'], device.id)
    await adb(['shell', 'chmod', '755', '/data/local/tmp/minicap.so'], device.id)
    await adb(['shell', '/data/local/tmp/atx-agent', 'server -d'], device.id)
    await adb(['forward', `tcp:${device.port}`, 'tcp:7912'], device.id)
    const { success } = await adb(['forward', `tcp:${device.port}`, 'tcp:7912'], device.id)
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
}

