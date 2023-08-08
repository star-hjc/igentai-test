// const { SerialPort } = require('serialport')
// const fs = require('fs')

// function delay (timeout = 1000) {
//     return new Promise(resolve => {
//         setTimeout(() => { resolve() }, timeout)
//     })
// }
// class Serial {
//     constructor () {
//         this.SerialProtList = {}
//     }
//     getSerialProtList () {
//         return SerialPort.list()
//     }
//     setSerialProt (path, baudRate, options) {
//         try {
//             if (this.SerialProtList[path]) {
//                 this.SerialProtList[path].baudRate = baudRate
//                 this.SerialProtList[path].SerialPort.update({ baudRate, ...options }, (err) => {
//                     // eslint-disable-next-line no-console
//                     console.error(err, '修改波特率或其他参数错误')
//                 })
//             } else {
//                 this.SerialProtList[path] = {
//                     baudRate: baudRate,
//                     SerialPort: new SerialPort({ path, baudRate, ...options })
//                 }
//             }
//             return this.SerialProtList[path].SerialPort
//         } catch (err) {
//             // eslint-disable-next-line no-console
//             console.error(err, '检测串口是否书写错误，或出现二次连接')
//         }
//     }
//     async serial ({ path, baudRate, options }) {
//         const { SerialPort, baudRate: oldbaudRate } = this.SerialProtList?.[path] || {}
//         if (oldbaudRate === baudRate) return SerialPort
//         return this.setSerialProt(path, baudRate, { autoOpen: false, ...options })
//     }

//     async closeSync (SerialPort) {
//         return new Promise((resolve, reject) => {
//             SerialPort.close((err) => {
//                 if (err) reject()
//                 resolve(SerialPort)
//             })
//         }).catch(() => {})
//     }

//     async openSync (SerialPort) {
//         return new Promise(async (resolve, reject) => {
//             if (SerialPort.isOpen || SerialPort.opening) {
//                 SerialPort.write(`\x03\nclear\n`, async (err) => {
//                     if (err) reject()
//                     await delay(2000)
//                     return resolve(SerialPort)
//                 })
//                 return
//             }
//             SerialPort.open((err) => {
//                 if (err) reject()
//                 resolve(SerialPort)
//             })
//         }).catch((err) => { console.log(err) })
//     }

//     async shell (command, serialOptions, callback) {
//         command = Array.isArray(command) ? command.join(' ') : command
//         let dataStr = ''
//         const serial = await this.openSync(await this.serial(serialOptions))
//         if (!serial) return console.log('该串口无法使用...')
//         serial.write(`${command}\n`)
//         if (callback) {
//             serial.on('data', async (data, serial) => callback(String(data), serial))
//             return {
//                 command: `${command}`,
//                 data: true,
//                 success: true,
//                 message: 'ok'
//             }
//         }
//         return new Promise((resolve, reject) => {
//             serial.on('error', err => {
//                 reject({
//                     command: `${command}`,
//                     data: err,
//                     success: false,
//                     message: err
//                 })
//             })
//             serial.on('data', async (data) => {
//                 if (/.*\s*console:\/\s+[#\$]\s*$/.test(String(data))) {
//                     const result = dataStr?.replace(/\^C\r*\n*/g, '')
//                         ?.replace(/.*\s*console:\/\s+[#\$]\s*/, '')
//                         ?.replace(/^clear\s+/, '')
//                         ?.replace(command, '')?.trim()
//                     fs.appendFileSync('./tttttt.txt', '\n' + dataStr + '\n')
//                     resolve({
//                         command: `${command}`,
//                         data: result,
//                         success: true,
//                         message: 'ok'
//                     })
//                     serial.close()
//                 }
//                 dataStr += String(data)
//             })
//         }).catch(res => { return res })
//     }
//     async getProce (proceNum, options = {}) {
//         const { data: output, success } = await this.shell(`COLUMNS=512 top -n 1 -m ${proceNum} -d 1`, options)
//         console.log(JSON.stringify(output))
//         let top = {}
//         let info = []
//         if (!output || !success) return { top, info }
//         const lines = String(output).trim()
//             .replace(/(.*?)(?=Tasks)/, '')
//             .replaceAll(/\x1B\[([0-9]{0,2})m/g, '')
//             .replace('Mem:', '')
//             .replace('Swap:', '')
//             .split('\n')
//             .map(v => v.trim())
//         const other = lines[0]?.indexOf('Tasks') === -1
//         if (other) {
//             top = lines[0]?.replaceAll('\r', '')?.split(/,\s+/).map(v => v.split(/\s+/)).reduce((a, b) => {
//                 a[b[0]] = b[1]
//                 return a
//             }, {})
//         } else {
//             top = lines.splice(3, 1).join(',').replaceAll('\r\r', '').split(',').map((v, i, arr) => {
//                 if (i === arr.length - 1) {
//                     const arr = v.replaceAll(/%/g, '%:').split(/\s+/).map(a => a.split(':'))
//                     return arr.reduce((a, b) => {
//                         a[b[1]] = b[0]
//                         return a
//                     }, {})
//                 }
//                 const arrs = v.trim().split(/\s+/)
//                 const newObj = {}
//                 newObj[arrs[1]] = arrs[0]
//                 return newObj
//             }).reduce((a, b) => Object.assign(a, b), {})
//             lines.splice(0, 3)
//         }

//         if (other) {
//             lines.splice(0, 4)
//             info = lines.map(v => {
//                 const process = v.trim().replace('\r\r', '').split(/\s+/)
//                 return {
//                     pid: process[0],
//                     pr: process[1],
//                     cpu: parseFloat(process[2]),
//                     s: process[3],
//                     thr: process[4],
//                     vss: process[5],
//                     rss: process[6],
//                     pcy: process[7],
//                     user: process[8],
//                     cmd: process[9]
//                 }
//             })
//         } else {
//             lines.splice(0, 1)
//             info = lines.map(v => {
//                 const process = v.trim().replace('\r\r', '').split(/\s+/)
//                 return {
//                     pid: parseInt(process[0], 10),
//                     user: process[1],
//                     pr: process[2],
//                     ni: parseInt(process[3]),
//                     virt: process[4],
//                     res: process[5],
//                     shr: process[6],
//                     s: process[7],
//                     cpu: parseFloat(process[8]),
//                     mem: parseFloat(process[9]),
//                     time: process[10],
//                     cmd: process[11]
//                 }
//             })
//         }
//         return { top, info }
//     }
// }

// // const data = new Serial();
// // console.log()

// const data = new Serial();
// (async () => {
//     // console.log(await data.shell('logcat', { path: 'COM13', baudRate: 921600 }))
//     // console.log(await data.shell('logcat', { path: 'COM13', baudRate: 921600 }, (data) => { console.log(data) }))
//     console.log(await data.getProce(10, { path: 'COM13', baudRate: 921600 }))
//     // console.log(11)
//     // data.shell('ifconfig', { path: 'COM5', baudRate: 115200 })
//     //

//     //
// })()
// // console.log(data.setSerialProt('COM5', 115200))

const dayjs = require('dayjs')

const start = dayjs('2023/6/28 17:22:33')
const end = dayjs('2023/6/28 18:22:39')

console.log(dayjs().startOf('day').add(end.diff(start) || 0, 'millisecond').format('HH:mm:ss'))
