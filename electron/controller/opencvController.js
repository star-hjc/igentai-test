const path = require('path')
const { ipcMain } = require('electron')
const { getImgMat } = require('../utils/opencv')
const { assetsPath } = require('../main/config')
const cv = require(path.join(assetsPath, 'opencv/opencv4nodejs.node'))

module.exports = { findImage }

function findImage () {
    ipcMain.handle('on-findImage-event', (event, base, imgData, option = {}) => {
        try {
            let baseMat = getImgMat(base)
            const imgMat = getImgMat(imgData)
            if (option.region && option.region?.length === 4) baseMat = baseMat.getRegion(new cv.Rect(...option.region))
            const matched = baseMat.matchTemplate(imgMat, cv.TM_CCOEFF_NORMED)
            const res = matched.threshold(option.threshold || 0.95, 1, cv.THRESH_BINARY)
            if (option.all) return filteredPoints(res.convertTo(cv.CV_8U).findNonZero(), 5, imgMat.cols, imgMat.rows)
            if (res.sum() > 0) {
                const loc = matched.minMaxLoc()
                return [loc.maxLoc.x + (imgMat.cols / 2), loc.maxLoc.y + (imgMat.rows / 2)]
            }
            return
        } catch (err) {
            // eslint-disable-next-line  no-console
            console.error(err)
            return
        }
    })
}

function filteredPoints (points, minDiff = 5, width = 0, height = 0) {
    // 过滤位置差别不打的位置
    const filteredPoints = []
    for (let i = 0; i < points.length; i++) {
        let isDifferent = true
        for (let j = 0; j < i; j++) {
            if (Math.abs(points[i].x - points[j].x) <= minDiff && Math.abs(points[i].y - points[j].y) <= minDiff) {
                isDifferent = false
                break
            }
        }
        if (isDifferent) {
            filteredPoints.push([points[i].x + (width / 2), points[i].y + (height / 2)])
        }
    }
    return filteredPoints
}
