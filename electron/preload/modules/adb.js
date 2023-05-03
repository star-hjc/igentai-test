const { ipcRenderer } = require('electron')

module.exports = {
    getDevices
}

function getDevices () {
    return ipcRenderer.invoke('on-getDevicesADB-event')
}
