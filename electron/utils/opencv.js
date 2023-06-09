
const path = require('path')
const { existsSync } = require('./file')
const { assetsPath } = require('../main/config')
const cv = require(path.join(assetsPath, 'opencv/opencv4nodejs.node'))

module.exports = { getImgMat }

function getImgMat (pathOrBase64) {
    if (existsSync(pathOrBase64)) return cv.imread(pathOrBase64)
    const base64 = pathOrBase64.split(',')
    return cv.imdecode(Buffer.from(base64[1] || base64[0], 'base64'))
}
