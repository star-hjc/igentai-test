const { ipcRenderer } = require('electron')

const findImage = (base, imgData, option) => {
    return ipcRenderer.invoke('on-findImage-event', base, imgData, option)
}

module.exports = {
    findImage
}
