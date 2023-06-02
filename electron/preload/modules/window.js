const { ipcRenderer } = require('electron')

module.exports = {
    createRunCaseWindow,
    createGetScreenWindow,
    createWorkBenchesWindow,
    createUiNodeWindow,
    createCPUWindow,
    createLogWindow,
    getAppInfo
}

function createWorkBenchesWindow (data, option) {
    return ipcRenderer.invoke('on-createWorkBenchesWindow-event', data, option)
}

function createRunCaseWindow (data, option) {
    return ipcRenderer.invoke('on-createRunCaseWindow-event', data, option)
}

function createGetScreenWindow (data, option) {
    return ipcRenderer.invoke('on-createGetScreenWindow-event', data, option)
}

function createUiNodeWindow (data, option) {
    return ipcRenderer.invoke('on-createUiNodeWindow-event', data, option)
}

function createCPUWindow (data, option) {
    return ipcRenderer.invoke('on-createCPUWindow-event', data, option)
}
function createLogWindow (data, option) {
    return ipcRenderer.invoke('on-createLogWindow-event', data, option)
}

function getAppInfo (data, option) {
    return ipcRenderer.invoke('on-getAppInfo-event', data, option)
}
