const { shell } = require('./command.js')
const request = require('./request.js')
const { adbCwd, assetsUrl, devEnv } = require('../config.js')
const xml2js = require('xml2js')
const xpath = require('xpath')
const { DOMParser } = require('xmldom')
const options = { cwd: adbCwd }
module.exports = class Auto {
    constructor (deviceId, prot = 6666, deviceProt = 7912) {
        // 获取全部本地端口判断，获取设备端端口设备判断唯一
        this.prot = prot
        this.host = `http://127.0.0.1:${prot}`
        this.deviceProt = deviceProt
        this.deviceId = deviceId
        this.init()
    }
    /** 连接adb，初始化 */
    async init () {
        this.initTime = 0
        if (!this.deviceId) {
            const device_id = (await this.getDevices())?.[0]?.device_id
            if (!device_id) return
            this.deviceId = device_id
        }

        const notExistPackages = async () => {
            const packages = (await this.initAdb(['shell', 'pm', 'list', 'packages'])).data
            return devEnv.packages.filter(v => packages?.indexOf(v.package) === -1)
        }
        const isExistAtxAgent = async () => {
            const atx = (await this.initAdb(['shell', 'ls', '/data/local/tmp/'])).data
            return atx?.indexOf('atx-agent') !== -1
        }
        const packages = await notExistPackages()
        const isExis = await isExistAtxAgent()
        if (packages.length === 0 && isExis) {
            this.isInit = true
            return `设备${this.deviceId}，连接完成！`
        }
        for (const key in packages) await this.initAdb(['install', `${assetsUrl}\\file\\${packages[key].name}`])
        if (!isExis) {
            await this.initAdb(['push', `${assetsUrl}\\file\\atx-agent`, '/data/local/tmp'])
        }
        await this.initAdb(['shell', 'chmod', '755', '/data/local/tmp/atx-agent'])
        await this.initAdb(['shell', '/data/local/tmp/atx-agent', 'server -d'])
        await this.initAdb(['forward', `tcp:${this.prot}`, `tcp:${this.deviceProt}`])
        await request.post(`${this.host}/uiautomator`)
        this.isInit = true
        return `设备${this.deviceId}，初始化完成！`
    }
    /** 等待adb初始化 */
    async waitInit () {
        if (!this.deviceId || this.isInit === true) return true
        if (this.initTime > 60) {
            if (!(await this.getDevices()).filter(v => v.device_id === this.deviceId).length) return false
            await this.killAdb()
            await this.delay()
            this.init()
        }
        await this.delay(1000)
        this.initTime++
        this.waitInit()
    }
    /** 初始化adb */
    async initAdb (args) {
        const device = this.deviceId ? ['-s', this.deviceId] : []
        return shell('adb', [...device, ...args], options)
    }
    /** adb命令行 */
    async adb (args) {
        await this.waitInit()
        return this.initAdb(args)
    }
    /** 关闭ADB服务 */
    async killAdb () {
        this.isInit = undefined
        return shell('adb', ['kill-server'], options)
    }
    /** 获取设备信息  */
    async getDevices () {
        const { data, success } = await shell('adb', ['devices'], options)
        if (!success) return [{}]
        return data.split('\r\n')?.filter(v => v.indexOf('\t') !== -1)?.map(v => {
            const [device_id, device] = v.split('\t')
            return { device_id, device }
        }) || [{}]
    }
    /** 获取屏幕大小、DPI */
    async getScreen () {
        let width, height, DPI
        await this.adb(['shell', 'wm', 'size']).then(({ data, success }) => {
            if (success) {
                [width, height] = data.split(': ')?.[1]?.split('x') || []
            }
        })
        await this.adb(['shell', 'wm', 'density']).then(({ data, success }) => {
            if (success) {
                DPI = data.split(': ')?.[1]
            }
        })
        return { width: width && Number(width), height: height && Number(height), DPI: DPI && Number(DPI) }
    }
    /** 获取截图 */
    async getScreenshot () {
        const arraybufferData = await request(`${this.host}/screenshot`, { responseType: 'arraybuffer' })
        return `data:image/png;base64,${arraybufferData ? Buffer.from(arraybufferData, 'binary').toString('base64') : '11'}`
    }
    /** 获取当前屏幕UI数据 */
    async getUi (type = 'xml') {
        const xml = (await request(`${this.host}/dump/hierarchy`))?.result
        if (type === 'xml') return xml
        if (type === 'json') return await xml2js.parseStringPromise(xml)
    }
    /** uiXML数据转化为DOM */
    async toDOM () {
        const xml = await this.getUi()
        if (!xml) return ''
        return new DOMParser().parseFromString(xml, 'text/xml')
    }
    /** 获取蓝牙开关状态 */
    async getBlueToothOn () {
        const { data } = await this.adb(['shell', 'settings', 'get', 'global', 'bluetooth_on'])
        return Boolean(Number(data))
    }
    /** 获取wifi开关状态 */
    async getWiFiOn () {
        const { data } = await this.adb(['shell', 'settings', 'get', 'global', 'wifi_on'])
        return Boolean(Number(data))
    }
    /** 文本输入事件  */
    async text (content) {
        await this.adb(['shell', 'settings', 'put', 'secure', 'default_input_method', 'com.android.adbkeyboard/.AdbIME'])
        await this.delay(1000)
        const data = await adb(['shell', 'am', 'broadcast', '-a', 'ADB_INPUT_TEXT', '--es', 'msg', `"${content}"`])
        await this.adb(['shell', 'settings', 'put', 'secure', 'default_input_method', 'com.kika.car.inputmethod/com.android.inputmethod.latin.LatinIME'])
        return data
    }
    /** 发送按键事件  */
    async keyevent (keycode) {
        return this.adb(['shell', 'input', 'keyevent', `"${keycode}"`])
    }
    /** 点击触屏事件  */
    async tap (x, y) {
        if (x === undefined || y === undefined) return
        return await this.adb(['shell', 'input', 'tap', `${x}`, `${y}`])
    }
    /** 拖动触屏事件 */
    async swipe (x, y, toX, toY, tiem) {
        return this.adb(['shell', 'input', 'swipe', `${x}`, `${y}`, `${toX}`, `${toY}`, `${tiem}`])
    }
    /** 长按 */
    async longpress (x, y, tiem) {
        return this.adb(['shell', 'input', 'longpress', `${x}`, `${y}`, `${tiem}`])
    }
    /** 根据<package_name/activity_name>启动APP  */
    async startApp (name) {
        return this.adb(['shell', 'am', 'start', '-n', `${name}`])
    }
    /** 延时 */
    async delay (timeout = 1000) {
        return new Promise(resolve => {
            setTimeout(() => { resolve() }, timeout)
        })
    }
    /** 随机数 */
    rand (max = 100, min = 0) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    /** 获取位置 */
    getPosition (str, x = 0, y = 0) {
        if (!str) return []
        const data = JSON.parse(str.replace('][', ','))
        return [this.rand(data[2], data[0]) + x, this.rand(data[3], data[1]) + y]
    }
    /** 空的参数 */
    notOptions () {
        return {
            text: '',
            exit: false,
            getXY: [],
            prop: () => { },
            click: () => { }
        }
    }
    async byText (name, options) {
        return new Promise(async (resolve, reject) => {
            const newOptions = { i: 0, x: 0, y: 0, ...options }
            const xmlDOM = await this.toDOM()
            const nodes = xpath.select(`//*[@text='${name}']`, xmlDOM)
            if (!nodes.length) return reject(this.notOptions())
            const bounds = nodes[newOptions.i].getAttribute('bounds')
            const position = this.getPosition(bounds, newOptions.x, newOptions.y)
            resolve(
                {
                    exit: true,
                    prop: function (propName) {
                        return nodes[newOptions.i].getAttribute(propName)
                    },
                    text: nodes[newOptions.i].getAttribute('text'),
                    xy: position,
                    click: this.initAdb.bind(this.initAdb, ['shell', 'input', 'tap', ...position])
                }
            )
        }).catch(res => { return res })
    }
    async byId (id, options) {
        return new Promise(async (resolve, reject) => {
            const newOptions = { i: 0, x: 0, y: 0, ...options }
            const xmlDOM = await this.toDOM()
            const nodes = xpath.select(`//*[@resource-id='${id}']`, xmlDOM)
            if (!nodes.length) return reject(this.notOptions())
            const bounds = nodes[newOptions.i].getAttribute('bounds')
            const position = this.getPosition(bounds, newOptions.x, newOptions.y)
            resolve(
                {
                    exit: true,
                    prop: function (propName) {
                        return nodes[newOptions.i].getAttribute(propName)
                    },
                    text: nodes[newOptions.i].getAttribute('text'),
                    xy: position,
                    click: this.initAdb.bind(this.initAdb, ['shell', 'input', 'tap', ...position])
                }
            )
        }).catch(res => { return res })
    }
    async byProp (props, options) {
        return new Promise(async (resolve, reject) => {
            if (!props) reject(this.notOptions())
            const newOptions = { i: 0, x: 0, y: 0, ...options }
            const xmlDOM = await this.toDOM()
            const nodes = xpath.select(`//*${props.map(v => `[@${v[0]}='${v[1]}']`).join('')}`, xmlDOM)
            if (!nodes.length) return reject(this.notOptions())
            const bounds = nodes[newOptions.i].getAttribute('bounds')
            const position = this.getPosition(bounds, newOptions.x, newOptions.y)
            resolve(
                {
                    exit: true,
                    prop: function (propName) {
                        return nodes[newOptions.i].getAttribute(propName)
                    },
                    text: nodes[newOptions.i].getAttribute('text'),
                    xy: position,
                    click: this.initAdb.bind(this.initAdb, ['shell', 'input', 'tap', ...position])
                }
            )
        }).catch(res => { return res })
    }
}
