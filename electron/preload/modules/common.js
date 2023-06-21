const { ipcRenderer } = require('electron')

module.exports = {
    setTitle,
    writeFile,
    cropImg,
    readFile,
    isDirectory,
    openBrowser,
    devTool,
    readdirCase,
    readdirLog,
    switchDevtools,
    createFile,
    getIpInfo,
    getLocalIPv4,
    getBasePath,
    createFolder,
    removeFile,
    getAssetsPath,
    openFileExplorer,
    renameFile,
    killServerByPname,
    getSerialPortList,
    downloadBase64,
    createReport
}

async function setTitle (title) {
    await ipcRenderer.invoke('on-setTitle-event', title)
}

async function devTool (isOpen) {
    await ipcRenderer.invoke('on-devTool-event', isOpen)
}

function openBrowser (url) {
    ipcRenderer.invoke('on-openBrowser-event', url)
}

function readdirCase (notTypes) {
    return ipcRenderer.invoke('on-readdirCase-event', notTypes)
}

function readdirLog () {
    return ipcRenderer.invoke('on-readdirLog-event')
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

function writeFile (filePath, data, cover) {
    return ipcRenderer.invoke('on-writeFile-event', filePath, data, cover)
}

function isDirectory (filePath) {
    return ipcRenderer.invoke('on-isDirectory-event', filePath)
}

function cropImg (imgBase64, args) {
    return ipcRenderer.invoke('on-cropImg-event', imgBase64, args)
}

function getBasePath (filePath, basePath) {
    return ipcRenderer.invoke('on-getBasePath-event', filePath, basePath)
}

function downloadBase64 (filePath, base64) {
    return ipcRenderer.invoke('on-downloadBase64-event', filePath, base64)
}

function createReport (title, deviceName, data, methods) {
    return ipcRenderer.invoke('on-createReport-event', title, deviceName, data, methods)
}
