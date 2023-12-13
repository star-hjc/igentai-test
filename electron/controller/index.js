const fs = require('fs')
const path = require('path')
const fileNames = fs.readdirSync(path.join(__dirname))?.filter(v => v.indexOf('Controller') !== -1)
if (!fileNames) throw new Error('[错误]：找不到控制器文件...')

/** 初始化控制器 */
module.exports = function initController () {
    fileNames.map(path => {
        const controller = require(`./${path}`)
        for (const key in controller) {
            controller[key] && controller[key]()
        }
    })
}

