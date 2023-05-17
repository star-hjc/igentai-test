const { ipcRenderer } = require('electron')

const runProcTask = (device, num, inter) => {
    ipcRenderer.invoke('on-runproctask-event', device, num, inter)
}
const runA72ProcTask = (param, num, inter) => {
    ipcRenderer.invoke('on-run-linux-proctask-event', param, num, inter)
}

const stopProcTask = () => {
    ipcRenderer.invoke('on-stopproctask-event')
}

const stopA72ProcTask = () => {
    ipcRenderer.invoke('on-stop-linux-proctask-event')
}

module.exports = {
    runProcTask,
    stopProcTask,
    runA72ProcTask,
    stopA72ProcTask
}

