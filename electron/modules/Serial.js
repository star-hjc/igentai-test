const { SerialPort } = require('serialport')

/**
 * ！！！ 存在高并发问题
 * 2023-05-04 Star 书写
 */

module.exports = class Serial {
    constructor (path = 'COM15', baudRate = 115200) {
        this.path = path
        this.baudRate = baudRate
        this.serialport = new SerialPort({ path, baudRate })
        this.cls()
    }
    async cls () {
        await this.shell('\x03')
    }
    close () {
        this.serialport.close()
    }
    async shell (command) {
        command = Array.isArray(command) ? command.join(' ') : command
        let dataStr = ''
        this.serialport.write(`${command}\n`)
        return new Promise((resolve, reject) => {
            this.serialport.on('error', err => {
                reject({
                    command: `${command}`,
                    data: err,
                    success: false,
                    message: err
                })
            })
            this.serialport.on('data', data => {
                if (String(data) === 'console:/ $ ') {
                    resolve(
                        dataStr.replace(/\^C\r*\n*/g, '')
                            .replace(/\d*\|*console:\/\s+\$/g, '')
                            .replace(command, '').trim()
                    )
                    this.close()
                }
                dataStr += String(data)
            })
        }).catch(res => { return res })
    }
}

