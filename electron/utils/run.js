const viewApi = require('../preload/modules/window')
const adbApi = require('../preload/modules/adb')
const appApi = require('../preload/modules/common')
const opencvApi = require('../preload/modules/opencv')
const dayjs = require('dayjs')
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

module.exports = async (code, device, runCallback, num) => {
    const adb = {}
    // if (/.*require\(.*/.test(code)) return
    // select.prototype
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    adb.tap = function (x, y) {
        return adbApi.tap.call(this, device, ...([x, y].filter(v => v !== undefined).flat()))
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
    async function querySelector (str, dom) {
        return (dom || await DOM())?.querySelector(str) || null
    }
    async function querySelectorAll (str, dom) {
        return (dom || await DOM())?.querySelectorAll(str) || null
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
    async function selectAll (str, dom) {
        return getProps(await querySelectorAll(str, dom))
    }
    // eslint-disable-next-line no-unused-vars
    async function select (str, dom) {
        return getProp((await querySelector(str, dom)))
    }
    // eslint-disable-next-line no-unused-vars
    function getProps (nodes) {
        if (!nodes || !nodes?.length) return []
        return [...nodes].map((v) => {
            return getProp(v)
        })
    }
    async function click (str, index = 0, dom) {
        const node = (await querySelectorAll(str, dom))?.[index]
        if (!node) return
        await adb.tap(...getXY(node))
        return node
    }
    // eslint-disable-next-line no-unused-vars
    async function clickId (resourceId, index, dom) {
        return click(`*[resource-id*='${resourceId}']`, index, dom)
    }
    // eslint-disable-next-line no-unused-vars
    async function clickText (text, index, dom) {
        return click(`*[text='${text}']`, index, dom)
    }
    // eslint-disable-next-line no-unused-vars
    const log = {
        log: pushLog.bind(this, ''),
        success: pushLog.bind(this, 'success'),
        info: pushLog.bind(this, 'info'),
        warning: pushLog.bind(this, 'warning'),
        danger: pushLog.bind(this, 'danger')
    }
    const logData = []
    const tableData = []
    function pushLog (lev = '', mgs = '') {
        // eslint-disable-next-line no-console
        console.log(mgs)
        logData.push({ lev, mgs, time: new Date().toLocaleString() })
    }
    let time = new Date()
    let pass = 0
    let fail = 0
    for (let i = 1; i <= (num || 1); i++) {
        try {
            if (device.id) {
                const data = await adb.setUiautomatorServe(1)
                if (!['Successfully started', 'Already started'].includes(data)) {
                    // eslint-disable-next-line no-console
                    console.log(data)
                    // eslint-disable-next-line no-console
                    console.warn('u2服务开启失败...')
                }
            }
            // eslint-disable-next-line no-eval
            await eval(`(async()=>{${code}})()`)
            await delay(1000)
            pass++
            await runCallback(i, true)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error)
            fail++
            await runCallback(i, false)
        }
    }
    time = new Date() - time
    const caseName = device.filePath.split('\\')?.at(-1)?.replace('.case', '') || '未知'
    device.caseName = caseName
    tableData.push({
        num: num || 1,
        pass,
        fail,
        fpy: `${(pass / num) * 100}%`,
        caseName,
        time: dayjs().startOf('day').add(time || 0, 'millisecond').format('HH:mm:ss')
    })
    if (num) appApi.createReport(device, device.id || device.path, { tableData, logData }, {})
}
