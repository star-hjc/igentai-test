
const { SerialPort } = require('serialport')
const fs = require('fs')

class Serial {
    constructor () {
        this.SerialProtList = {}
    }
    getSerialProtList () {
        return SerialPort.list()
    }
    setSerialProt (path, baudRate, options) {
        try {
            if (this.SerialProtList[path]) {
                this.SerialProtList[path].baudRate = baudRate
                this.SerialProtList[path].SerialPort.update({ baudRate, ...options }, (err) => {
                    // eslint-disable-next-line no-console
                    console.error(err, '修改波特率或其他参数错误')
                })
            } else {
                this.SerialProtList[path] = {
                    baudRate: baudRate,
                    SerialPort: new SerialPort({ path, baudRate, ...options })
                }
            }
            return this.SerialProtList[path].SerialPort
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err, '检测串口是否书写错误，或出现二次连接')
        }
    }
    serial ({ path, baudRate, options }) {
        const { SerialPort, baudRate: oldbaudRate } = this.SerialProtList?.[path] || {}
        // if (!baudRate && Object.keys(SerialPort).length) SerialPort
        if (oldbaudRate === baudRate) return SerialPort
        return this.setSerialProt(path, baudRate, options || {})
    }

    async shell (command, serialOptions, callback) {
        command = Array.isArray(command) ? command.join(' ') : command
        let dataStr = ''
        const serial = this.serial(serialOptions)
        console.log(serial.opening, serial.closing, serial.isOpen)
        if (serial.opening) await serial.close()
        if (serial.closing) await serial.open()
        serial.write(`\x03\n${command}\n`)
        if (callback) {
            serial.on('data', async (data, serial) => callback(String(data), serial))
            return {
                command: `${command}`,
                data: true,
                success: true,
                message: 'ok'
            }
        }
        return new Promise((resolve, reject) => {
            serial.on('error', err => {
                reject({
                    command: `${command}`,
                    data: err,
                    success: false,
                    message: err
                })
            })
            serial.on('data', async (data) => {
                if (/console:\/\s+(#|\$)\s+$/.test(String(data))) {
                    const result = dataStr?.replace(/\^C\r*\n*/g, '')
                        ?.replace(/\d*\|*console:\/\s+(#|\$)\s+/g, '')
                        ?.replace(command, '')?.trim()
                    resolve({
                        command: `${command}`,
                        data: result,
                        success: true,
                        message: 'ok'
                    })
                    serial.close()
                }
                dataStr += String(data)
            })
        }).catch(res => { return res })
    }
    async getProce (proceNum, options = {}) {
        const { data: output, success } = await this.shell(`COLUMNS=512 top -n 1 -m ${proceNum} -d 1`, options)
        if (!success || !output) return { top: {}, info: [] }
        const lines = `${output}`.trim()
            .replace(/(.*?)(?=Tasks)/, '')
            .replaceAll(/\x1B\[([0-9]{0,2})m/g, '')
            .replace(/(.*?)(?=COLUMNS=512 top).*/, '')
            .replace('Tasks:', '')
            .replace('Mem:', '')
            .replace('Swap:', '')
            .split('\n')
            .filter(v => v && v !== '\r' && v !== '\r\r')
        const data = lines.splice(0, 4).join(',').replaceAll('\r\r', '').split(',')
        // console.log(data)
        const top = data.map((v, i, arr) => {
            if (i === arr.length - 1) {
                const arr = v.replaceAll('\r', '').replaceAll(/%/g, '%:').split(/\s+/).map(a => a.split(':'))
                return arr.reduce((a, b) => {
                    a[b[1]] = b[0]
                    return a
                }, {})
            }
            const args = v.trim().split(/\s+/)
            // console.log(v)
            const newObj = {}
            newObj[args[1]] = args[0]
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

function writeFileSync (filePath, data, cover = false) {
    try {
        if (fs.existsSync(filePath) && cover) {
            fs.appendFileSync(filePath, data)
            return true
        }
        fs.writeFileSync(filePath, data)
        return true
    } catch (err) {
        return false
    }
}

const data = new Serial();
(async () => {
    // await data.shell('echo 1 > /proc/sys/kernel/printk', { path: 'COM3', baudRate: 921600 })
    console.log(await data.shell('logcat -b all -c', { path: 'COM5', baudRate: 115200 }))
    console.log(await data.shell('logcat -b all -c', { path: 'COM5', baudRate: 115200 }))
    console.log(await data.shell('logcat -b all -c', { path: 'COM5', baudRate: 115200 }))

    // await data.shell('123', { path: 'COM5', baudRate: 115200 }, (data) => {
    //     console.log(data)
    //     writeFileSync('./G05-01-Mcu.log', data + '\n', true)
    // })

    // console.log(await data.getProce(10, { path: 'COM3', baudRate: 921600 }))
})()
// console.log(data.setSerialProt('COM5', 115200))

