const { SerialPort } = require('serialport')

/**
 * ！！！ 存在并发问题
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

    async getProce (proceNum) {
        const output = await this.shell(`COLUMNS=512 top -n 1 -m ${proceNum} -d 1\n`)
        if (!output) return { top: {}, info: [] }

        const lines = `${output}`.trim()
            .replace(/(.*?)(?=Tasks)/, '')
            .replaceAll(/\x1B\[([0-9]{0,2})m/g, '')
            .replaceAll('console:/ $', '')
            .replaceAll('^C', '')
            .replace(/(.*?)(?=COLUMNS=512 top).*/, '')
            .replace('Tasks:', '')
            .replace('Mem:', '')
            .replace('Swap:', '')
            .split('\n')
            .filter(v => v && v !== '\r' && v !== '\r\r')
        const top = lines.splice(0, 4).join(',').replaceAll('\r\r', '').split(',').map((v, i, arr) => {
            if (i === arr.length - 1) {
                const arr = v.replaceAll(/%/g, '%:').split(/\s+/).map(a => a.split(':'))
                return arr.reduce((a, b) => {
                    a[b[1]] = b[0]
                    return a
                }, {})
            }
            const arrs = v.trim().split(/\s+/)
            const newObj = {}
            newObj[arrs[1]] = arrs[0]
            return newObj
        }).reduce((a, b) => Object.assign(a, b), {})
        lines.splice(0, 1)

        const info = lines.map(v => {
            const process = v.trim().replace('\r\r', '').split(/\s+/)
            return {
                pid: parseInt(process[0], 10),
                user: process[1],
                pr: parseInt(process[2]),
                ni: parseInt(process[3]),
                virt: process[4],
                res: process[5],
                shr: process[6],
                s: process[7],
                cpu: parseFloat(process[8]),
                mem: parseFloat(process[9]),
                time: process[10],
                cmd: process[11]
            }
        })
        return { top, info }
    }
}

