module.exports = { bw, delay, sleep, rand, arrayMatched, loopByTime, loopByNum }

/**
 * 等待
 * @param {Number} timeout 等待时间
 */
function delay (timeout = 1000) {
    return new Promise(resolve => {
        setTimeout(() => { resolve() }, timeout)
    })
}

/**
 * 等待
 * @param {Number} timeout 等待时间
 */
function sleep (timeout = 1000) {
    for (var time = new Date(); new Date() - time <= timeout;);
}

/**
 *  数组对比
 * @param {Array} arrOne 第一个数组
 * @param {Array} arrTwo 第二个数组
 * @param {Function | Boolean} callback 返回一个callback(第一个数组少的值{String},第一个数组多的值{String})
 * @returns {Object} 第一个数组少的值{Array},第一个数组多的值{Array}
 */
function arrayMatched (arrOne, arrTwo, callback) {
    if (!(arrOne instanceof Array) || !(arrTwo instanceof Array)) throw new Error('[error]:前两个参数为数组...')
    const one = arrOne.length
    const two = arrTwo.length
    if (callback instanceof Function) {
        for (let i = 0; i < Math.max(one, two); i++) {
            let lackIsOne, lackIsTwo
            if (i < two && !arrOne.includes(arrTwo[i])) lackIsOne = arrTwo[i]
            if (i < one && !arrTwo.includes(arrOne[i])) lackIsTwo = arrOne[i]
            callback(lackIsTwo, lackIsOne)
        }
        return
    }
    const lackIsOne = arrOne.filter(v => !arrTwo.includes(v))
    const lackIsTwo = arrTwo.filter(v => !arrOne.includes(v))
    return { lackIsOne, lackIsTwo }
}

/**
 * 生成一个随机数
 * @param {Number} max 最大值
 * @param {Number} min 最小值
 * @returns {Number}
 */
function rand (max = 100, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 限时循环
 * @param {Function} callback 循环体
 * @param {Number} timeout 循环时间
 * @param {String} errMgs 错误消息
 */
async function loopByTime (callback, timeout, errMgs = '') {
    const start = new Date()
    let result
    while (new Date() - start <= timeout) {
        result = await callback()
        if (result) break
        await delay(100)
    }
    if (!result && errMgs) throw new Error(errMgs)
}

/**
 * 限次循环
 * @param {Function} callback 循环体
 * @param {Number} num 循环次数
 * @param {String} errMgs 错误消息
 */
async function loopByNum (callback, num, errMgs = '') {
    let result
    for (let i = 0; i < num; i++) {
        result = await callback()
        if (result) break
        await delay(100)
    }
    if (!result && errMgs) throw new Error(errMgs)
}

/** 算报文 */
function bw (num, lsb, size, binary = 16, length = 8) {
    const result = parseInt(num, binary).toString(2).slice(-size).padStart(size, '0')
    const byteArr = Array(length).fill().map(() => Array(length).fill(0))
    let x = 7 - parseInt(lsb % 8)
    let y = parseInt(lsb / 8)
    for (let i = 0; i < size; i++) {
        if (y > length - 1 || y < 0) break
        byteArr[y][x] = parseInt(result.charAt(size - i - 1))
        x -= 1
        if (x < 0) { y -= 1; x = 7 }
    }
    return byteArr.map(v => parseInt(v.slice(0, 4).join(''), 2).toString(16) + parseInt(v.slice(4, 8).join(''), 2).toString(16)).join('')
}

