const { ipcRenderer } = require('electron')

module.exports = {
    setTitle,
    writeFile,
    readFile,
    openBrowser,
    readdirCase,
    switchDevtools,
    createFile,
    getIpInfo,
    getLocalIPv4,
    createFolder,
    removeFile,
    getAssetsPath,
    openFileExplorer,
    renameFile,
    killServerByPname,
    getSerialPortList
}

async function setTitle (title) {
    await ipcRenderer.invoke('on-setTitle-event', title)
}

function openBrowser (url) {
    ipcRenderer.invoke('on-openBrowser-event', url)
}

function readdirCase () {
    return ipcRenderer.invoke('on-readdirCase-event')
}

function switchDevtools () {
    ipcRenderer.invoke('on-switchDevtools-event')
}

function createFile (filePath, fileName, content, cover) {
    ipcRenderer.invoke('on-createFile-event', filePath, fileName, content, cover)
}

function createFolder (filePath, folderName) {
    ipcRenderer.invoke('on-createFolder-event', filePath, folderName)
}

function removeFile (filePath, recursive) {
    ipcRenderer.invoke('on-removeFile-event', filePath, recursive)
}

function getAssetsPath (suffixPath) {
    return ipcRenderer.invoke('on-getAssetsPath-event', suffixPath)
}

function getSerialPortList () {
    return ipcRenderer.invoke('on-getSerialPortList-event')
}

function killServerByPname (pName) {
    return ipcRenderer.invoke('on-killServerByPname-event', pName)
}

function openFileExplorer (filePath) {
    ipcRenderer.invoke('on-openFileExplorer-event', filePath)
}

function getIpInfo () {
    return ipcRenderer.invoke('on-getIpInfo-event')
}

function getLocalIPv4 () {
    return ipcRenderer.invoke('on-getLocalIPv4-event')
}

function renameFile (filePath, fileNameOrNewPath, move) {
    ipcRenderer.invoke('on-renameFile-event', filePath, fileNameOrNewPath, move)
}

function readFile (filePath) {
    return ipcRenderer.invoke('on-readFile-event', filePath)
}

function writeFile (filePath, data) {
    return ipcRenderer.invoke('on-writeFile-event', filePath, data)
}
