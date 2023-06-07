
const path = require('path')
const { lstatSync } = require('./file')
const { assetsPath } = require('../main/config')
const cv = require(path.join(assetsPath, 'opencv/opencv4nodejs.node'))

module.exports = { getImgMat }

function getImgMat (pathOrBase64) {
    if (lstatSync(pathOrBase64)) return cv.imread(pathOrBase64)
    return cv.imdecode(pathOrBase64)
}
