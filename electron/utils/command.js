const cp = require('child_process')
const path = require('path')
const { assetsPath } = require('../main/config')
const file = require('./file')
const logPath = path.join(assetsPath, 'log/adb.log')

module.exports = { exec, spawn, shell }

async function exec (command, options) {
    return new Promise((resolve, reject) => {
        cp.exec(command, { ...options }, (err, stdout) => {
            if (err) {
                file.writeFileSync(logPath, `${new Date().toLocaleString()}\ncmd:${command}\nerr:${err}\n`, true)
                return reject(err)
            }
            file.writeFileSync(logPath, `${new Date().toLocaleString()}\ncmd:${command}\ndata:${stdout}\n`, true)
            resolve(stdout)
        })
    }).catch(() => null)
}

async function spawn (command, args, options) {
    return new Promise((resolve, reject) => {
        const childProcess = cp.spawn(command, args, options)
        let stdout = ''
        childProcess.stdout.on('data', (data) => {
            stdout += data.toString()
        })

        let stderr = ''
        childProcess.stderr.on('data', (data) => {
            stderr += data.toString()
        })

        childProcess.on('error', (err) => {
            // eslint-disable-next-line no-console
            console.error('Failed to start subprocess.', err)
            reject()
        })

        childProcess.on('close', (code) => {
            if (code !== 0) {
                const error = new Error(`Command ${command} ${args.join(' ')} failed with code ${code}`)
                error.code = code
                error.stdout = stdout.trim()
                error.stderr = stderr.trim()
                reject(error)
            } else {
                resolve(stdout.trim())
            }
        })

        if (options && options.input) {
            childProcess.stdin.write(options.input)
            childProcess.stdin.end()
        }
    }).catch(() => null)
}

async function shell (command, args, options) {
    return new Promise((resolve, reject) => {
        const childProcess = cp.spawn(command, args, options)
        let stdout = ''
        let stderr = ''

        childProcess.stdout.on('data', data => {
            stdout += data.toString()
        })

        childProcess.stderr.on('data', data => {
            stderr += data.toString()
        })

        childProcess.on('error', (err) => {
            file.writeFileSync(logPath, `${new Date().toLocaleString()}\ncmd:${command} ${args.join(' ')}\nerr:${err?.message}\n`, true)
            reject({
                command: `${command} ${args.join(' ')}`,
                data: null,
                success: false,
                message: err?.message
            })
        })

        childProcess.on('close', code => {
            if (code !== 0) {
                file.writeFileSync(logPath, `${new Date().toLocaleString()}\ncmd:${command} ${args.join(' ')}\nerr:${stderr}\n`, true)
                return reject({
                    command: `${command} ${args.join(' ')}`,
                    data: stderr,
                    success: false,
                    message: stderr
                })
            }
            file.writeFileSync(logPath, `${new Date().toLocaleString()}\ncmd:${command} ${args.join(' ')}\ndata:${stdout}\n`, true)
            resolve({
                command: `${command} ${args.join(' ')}`,
                data: stdout,
                success: true
            })
        })
    }).catch(res => res)
}

