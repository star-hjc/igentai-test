const cp = require('child_process')
const viewApi = require('../preload/modules/window')
const adbApi = require('../preload/modules/adb')
const opencvApi = require('../preload/modules/opencv')
/* eslint-disable */
const { getAssetsPath, writeFile, cropImg } = require('../preload/modules/common')

const {
    bw,
    delay,
    sleep,
    rand,
    arrayMatched,
    loopByNum,
    loopByTime
} = require('./common')
const { select } = require('xpath')
/* eslint-enable */

module.exports = async (code, device) => {
    const adb = {}
    // if (/.*require\(.*/.test(code)) return
    // select.prototype
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    adb.tap = function (x, y) {
        return adbApi.tap.call(this, device, ...([x, y].filter(v => v !== undefined).flat()))
    }
    if (device.id) {
        const data = await adb.setUiautomatorServe(1)
        if (!['Successfully started', 'Already started'].includes(data)) {
            console.warn('u2服务开启失败...')
        }
    }
    async function DOM () {
        return new DOMParser().parseFromString(await adb.getUI(), 'text/xml')
    }
    // eslint-disable-next-line no-unused-vars
    async function findImage (imgName = '', option) {
        const base64 = (await adb.getScreenshot()).split(',')?.[1]
        if (!base64) return
        const url = new URL(`${imgName || '../'}`, device.filePath).href.replace('file:///', '')
        return await opencvApi.findImage(base64, url, option)
    }
    // eslint-disable-next-line no-unused-vars
    async function querySelector (str) {
        return (await DOM())?.querySelector(str) || null
    }
    async function querySelectorAll (str) {
        return (await DOM())?.querySelectorAll(str) || null
    }
    // eslint-disable-next-line no-unused-vars
    async function ocr (options, file) {
        return await viewApi.ocr(file || await adb.getScreenshot(), options)
    }
    // eslint-disable-next-line no-unused-vars
    function getText (node) {
        return getProp(node)?.text || ''
    }
    function getXY (node, x = 0, y = 0) {
        if (!node) return
        if (node.length) node = node[0]
        const str = node?.getAttribute('bounds')
        if (!str) return []
        const data = JSON.parse(str.replace('][', ','))
        return [((data[0] + data[2]) / 2 || 0) + x, ((data[1] + data[3]) / 2) || y]
    }
    // eslint-disable-next-line no-unused-vars
    function getRange (node) {
        if (!node) return
        if (node.length) node = node[0]
        const str = node?.getAttribute('bounds')
        if (!str) return []
        const data = JSON.parse(str.replace('][', ','))
        return data
    }
    function getProp (node) {
        if (!node?.attributes) return
        if (node.length) node = node[0]
        return Object.values(node.attributes)?.reduce((a, b) => {
            a[b.name] = b.value
            if (b.name === 'bounds') a.xy = getXY(node)
            return a
        }, {})
    }
    /** 弃用 */
    // eslint-disable-next-line no-unused-vars
    async function byText (name, cb, obj) {
        const newObj = { i: 0, x: 0, y: 0, ...obj }
        const nodes = await querySelectorAll(`[text='${name}']`)
        await cb(getXY(nodes[newObj.i]), nodes[newObj.i])
        return nodes?.length ? nodes[newObj.i] : undefined
    }
    /** 弃用 */
    // eslint-disable-next-line no-unused-vars
    async function byId (id, cb, obj) {
        const newObj = { i: 0, x: 0, y: 0, ...obj }
        const nodes = await querySelectorAll(`[resource-id*='${id}']`)
        await cb(getXY(nodes[newObj.i]), nodes[newObj.i])
        return nodes?.length ? nodes[newObj.i] : undefined
    }
    /** 弃用 */
    // eslint-disable-next-line no-unused-vars
    function arrF (arrAll, arr, callback) {
        if (!arr?.length) return callback(arrAll.join(','))
        for (const item of arr) {
            if (!arrAll.includes(item)) callback(item)
        }
    }
    // eslint-disable-next-line no-unused-vars
    async function selectAll (str) {
        return getProps(await querySelectorAll(str))
    }
    // eslint-disable-next-line no-unused-vars
    async function select (str) {
        return getProp((await querySelector(str)))
    }
    // eslint-disable-next-line no-unused-vars
    function getProps (nodes) {
        if (!nodes || !nodes?.length) return []
        return [...nodes].map((v) => {
            return getProp(v)
        })
    }
    async function click (str, index = 0, callback) {
        const node = (await querySelectorAll(str))?.[index]
        if (!node) return
        if (await callback(node)) return
        await adb.tap(...getXY(node))
        return node
    }
    // eslint-disable-next-line no-unused-vars
    async function clickId (resourceId, index, str) {
        return click(`*[resource-id*='${resourceId}']`, index, (node) => {
            if (!str) return
            return node?.querySelector(str)
        })
    }
    // eslint-disable-next-line no-unused-vars
    async function clickText (text, index, str) {
        return click(`*[text='${text}']`, index, (node) => {
            if (!str) return
            return node?.querySelector(str)
        })
    }
    let childProcess = null

    if (device.id) {
        const logPath = await getAssetsPath(`log/${device.id}-${new Date().toLocaleString().replace(/\s/g, '').replace(/\//g, '').replace(/:/g, '')}.log`)
        const cw = await getAssetsPath('/exe')
        cp.spawn('adb', ['-s', `${device.id}`, 'logcat', '-b', 'all', '-c'], { cw })
        await delay(1000)
        childProcess = cp.spawn('adb', ['-s', `${device.id}`, 'logcat'], { cw })
        childProcess.stderr.on('data', (data) => {
            writeFile(logPath, data.toString(), true)
        })
        childProcess.stdout.on('data', (data) => {
            writeFile(logPath, data.toString(), true)
        })
    }
    setTimeout(() => {
        childProcess?.kill()
    }, 1000)
    // eslint-disable-next-line no-eval
    const runResult = await eval(`(async()=>{${code}})()`)
    await delay(1000)
    return runResult
}
