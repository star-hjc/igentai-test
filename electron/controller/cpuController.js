const { ipcMain, BrowserWindow } = require('electron')
const ProcTask = require('../modules/ProcTask')
let proc = null
let procA72 = null

const runProcTask = () => {
    ipcMain.handle('on-runproctask-event', (event, device, num, inter) => {
        proc = new ProcTask(device, num, inter)
        proc.run((data) => {
            if (BrowserWindow.getFocusedWindow()?.webContents) BrowserWindow.getFocusedWindow().webContents.send('call-cpu-event', data)
        })
    })
}

const runA72ProcTask = () => {
    ipcMain.handle('on-run-linux-proctask-event', (event, param, num, inter) => {
        procA72 = new ProcTask('', num, inter)
        procA72.runA72(param, (data) => {
            if (BrowserWindow.getFocusedWindow()?.webContents) BrowserWindow.getFocusedWindow().webContents.send('call-cpu-linux-event', data)
        })
    })
}

const stopProcTask = () => {
    ipcMain.handle('on-stopproctask-event', async (event) => {
        proc.stop()
    })
}

const stopA72ProcTask = () => {
    ipcMain.handle('on-stop-linux-proctask-event', async (event) => {
        procA72.stopA72()
    })
}

module.exports = {
    runProcTask,
    stopProcTask,
    runA72ProcTask,
    stopA72ProcTask
}
