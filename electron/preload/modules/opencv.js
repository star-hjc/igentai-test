const { ipcRenderer } = require('electron')

const findImage = (base, imgData) => {
    ipcRenderer.invoke('on-findImage-event', base, imgData)
}

module.exports = {
    findImage
}
