
module.exports = { delay, arrayMatched }

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
            callback(lackIsOne, lackIsTwo)
        }
        return
    }
    const lackIsOne = arrOne.filter(v => !arrTwo.includes(v))
    const lackIsTwo = arrTwo.filter(v => !arrOne.includes(v))
    return { lackIsOne, lackIsTwo }
}
