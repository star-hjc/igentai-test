const { ipcRenderer } = require('electron')

module.exports = {
    setTitle,
    openBrowser,
    readdirCase,
    switchDevtools,
    createFile,
    createFolder,
    removeFile,
    getAssetsPath,
    openFileExplorer,
    renameFile,
    createWorkBenchesWindow
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

function openFileExplorer (filePath) {
    ipcRenderer.invoke('on-openFileExplorer-event', filePath)
}

function renameFile (filePath, fileNameOrNewPath, move) {
    ipcRenderer.invoke('on-renameFile-event', filePath, fileNameOrNewPath, move)
}

function createWorkBenchesWindow (option) {
    ipcRenderer.invoke('on-createWorkBenchesWindow-event', option)
}
