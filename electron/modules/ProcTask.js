
const { exec } = require('child_process')
const Serial = require('./Serial.js')

module.exports = class ProcTask {
    constructor (device, proceNum = 10, inter = 5) {
        this.device = device
        this.num = proceNum
        this.inter = inter
    }

    async run (callblack) {
        callblack(await this.getProce())
        this.time = setInterval(async () => {
            callblack(await this.getProce())
        }, this.inter * 1000)
    }

    async runA72 (param = {}, callblack) {
        this.serial = new Serial(param.path, param.baudRate)
        callblack(await this.serial.getProce(this.num))
        this.timeA72 = setInterval(async () => {
            this.serial = new Serial(param.path, param.baudRate)
            callblack(await this.serial.getProce(this.num))
        }, this.inter * 1000)
    }

    stop () {
        clearInterval(this.time)
    }

    stopA72 () {
        clearInterval(this.timeA72)
    }

    async getProce () {
        const output = await new Promise((resolve, reject) => {
            exec(`adb -s ${this.device} shell COLUMNS=512 top -n 1 -m ${this.num} -d 1`, (err, data) => {
                if (err) return reject('')
                resolve(data)
            })
        }).catch(res => res)
        let top = {}
        let info = []
        if (!output) return { top, info }
        const lines = String(output).trim()
            .replace(/(.*?)(?=Tasks)/, '')
            .replaceAll(/\x1B\[([0-9]{0,2})m/g, '')
            .replace('Mem:', '')
            .replace('Swap:', '')
            .split('\n')
            .filter(v => v.indexOf('\r\r') !== -1)

        const other = lines[0].indexOf('Tasks') === -1

        if (other) {
            top = lines[0]?.replaceAll('\r', '')?.split(/,\s+/).map(v => v.split(/\s+/)).reduce((a, b) => {
                a[b[0]] = b[1]
                return a
            }, {})
        } else {
            top = lines.splice(0, 4).join(',').replaceAll('\r\r', '').split(',').map((v, i, arr) => {
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
        }

        if (other) {
            lines.splice(0, 4)
            info = lines.map(v => {
                const process = v.trim().replace('\r\r', '').split(/\s+/)
                return {
                    pid: process[0],
                    pr: process[1],
                    cpu: parseFloat(process[2]),
                    s: process[3],
                    thr: process[4],
                    vss: process[5],
                    rss: process[6],
                    pcy: process[7],
                    user: process[8],
                    cmd: process[9]
                }
            })
        } else {
            lines.splice(0, 1)
            info = lines.map(v => {
                const process = v.trim().replace('\r\r', '').split(/\s+/)
                return {
                    pid: parseInt(process[0], 10),
                    pr: parseInt(process[1]),
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
        }
        return { top, info }
    }
}
