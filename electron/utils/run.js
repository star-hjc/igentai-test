const cp = require('child_process')
const adbApi = require('../preload/modules/adb')
const { getAssetsPath, writeFile } = require('../preload/modules/common')

/* eslint-disable */
const {
    delay,
    sleep,
    rand,
    arrayMatched,
    loopByTime
} = require('./common')
/* eslint-enable */

module.exports = async (code, device) => {
    const adb = {}
    // if (/.*require\(.*/.test(code)) return
    // select.prototype
    for (const key in adbApi) { adb[key] = adbApi[key].bind(this, device) }
    async function DOM () {
        return new DOMParser().parseFromString(await adb.getUI(), 'text/xml')
    }
    // eslint-disable-next-line no-unused-vars
    async function querySelector (str) {
        return (await DOM())?.querySelector(str) || {}
    }
    async function querySelectorAll (str) {
        return (await DOM())?.querySelectorAll(str) || []
    }
    function getXY (node, x = 0, y = 0) {
        if (node.length) node = node[0]
        if (!node) return
        const str = node?.getAttribute('bounds')
        if (!str) return []
        const data = JSON.parse(str.replace('][', ','))
        return [((data[0] + data[2]) / 2 || 0) + x, ((data[1] + data[3]) / 2) || y]
    }
    function getProp (node) {
        if (!node) return {}
        if (node.length) node = node[0]
        return Object.values(node.attributes)?.reduce((a, b) => {
            a[b.name] = b.value
            return a
        }, {})
    }
    // eslint-disable-next-line no-unused-vars
    function getProps (nodes) {
        if (!nodes || !nodes?.length) return []
        return [...nodes].map((v) => {
            return getProp(v)
        })
    }
    async function click (str, index = 0) {
        const node = querySelectorAll(str)?.[index]
        if (!node) return
        await adb.tap(...getXY(node))
        return node
    }
    // eslint-disable-next-line no-unused-vars
    async function clickId (resourceId, index) {
        return click(`*[resource-id*='"${resourceId}"']`, index)
    }
    let childProcess = null
    if (device.id) {
        const logPath = await getAssetsPath(`log/${device.id}-${new Date().getTime()}.log`)
        const cw = await getAssetsPath('/exe')
        cp.spawn('adb', ['-s', `${device.id}`, 'logcat', '-b', 'all', '-c'], { cw })
        await delay(1000)
        childProcess = cp.spawn('adb', ['-s', `${device.id}`, 'logcat'], { cw })
        childProcess.stderr.on('data', (data) => {
            writeFile(logPath, data.toString())
        })
        childProcess.stdout.on('data', (data) => {
            writeFile(logPath, data.toString())
        })
    }

    // eslint-disable-next-line no-eval
    const runResult = await eval(`(async()=>{${code}})()`)
    await delay(1000)
    childProcess?.kill()
    return runResult
}
