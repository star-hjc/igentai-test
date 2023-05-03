const path = require('path')
const { app } = require('electron')

const isPackaged = app.isPackaged

module.exports = {
    /** 静态文件地址 */
    assetsPath: path.join(process.cwd(), `${isPackaged ? '/resources' : '/electron'}/assets`),
    /** 渲染文件入口 */
    loadURL: isPackaged ? `file://${path.join(__dirname, '../../dist/index.html')}` : `http://127.0.0.1:${process.argv.at(-1)}`,
    /** 环境 */
    env: {
        flie: ['atx-agent', 'minicap', 'minicap.so'],
        packages: [
            { name: 'app-uiautomator.apk', package: 'com.github.uiautomator' },
            { name: 'app-uiautomator-test.apk', package: 'com.github.uiautomator.test' },
            { name: 'ADBKeyboard.apk', package: 'package:com.android.adbkeyboard' }
        ]
    }
}
