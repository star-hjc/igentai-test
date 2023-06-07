const path = require('path')
const { ipcMain } = require('electron')
const { getImgMat } = require('../utils/opencv')
const { assetsPath } = require('../main/config')
const cv = require(path.join(assetsPath, 'opencv/opencv4nodejs.node'))

module.exports = { findImage }

function findImage () {
    ipcMain.handle('on-findImage-event', (event, base, imgData, option = {}) => {
        try {
            const matched = getImgMat(base).matchTemplate(getImgMat(imgData), cv.TM_CCOEFF_NORMED)
            return matched.threshold(option.threshold || 0.9, 1, cv.THRESH_BINARY)
                .convertTo(cv.CV_8U)
                .findNonZero()
        } catch (err) {
            // eslint-disable-next-line  no-console
            console.error(err)
            return
        }
    })
}

