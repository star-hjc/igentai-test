
const path = require('path')
const { ipcMain } = require('electron')
const { assetsPath } = require('../main/config')
const { shell } = require('../utils/command')

const options = { cwd: path.join(assetsPath, 'exe') }

module.exports = {
    getDevices
}

/** 获取设备信息  */
async function getDevices () {
    ipcMain.handle('on-getDevicesADB-event', async (event) => {
        const { data, success } = await shell('adb', ['devices'], options)
        if (!success) return []
        return data.split('\r\n')?.filter(v => v.indexOf('\t') !== -1)?.map(v => {
            const [device_id, device] = v.split('\t')
            return { device_id, device }
        })
    })
}
