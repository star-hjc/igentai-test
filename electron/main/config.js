const path = require('path')
const { app } = require('electron')

const isPackaged = app.isPackaged
const assetsPath = path.join(process.cwd(), `${isPackaged ? '/resources' : '/electron'}/assets`)
module.exports = {
    /** 静态文件地址 */
    assetsPath,
    /** 渲染文件入口  127.0.0.1 */
    loadURL: isPackaged ? `file://${path.join(__dirname, '../../dist/index.html')}` : `http://localhost:${process.argv.at(-1)}`,
    /** 环境 */
    env: {
        // 'atx-agent', 'minicap', 'minicap.so'
        files: [
            { name: 'atx-agent', path: path.join(assetsPath, 'package', 'atx-agent') },
            { name: 'minicap', path: path.join(assetsPath, 'package', 'minicap') },
            { name: 'minicap.so', path: path.join(assetsPath, 'package', 'minicap.so') }
        ],
        packages: [
            { path: path.join(assetsPath, 'package', 'app-uiautomator.apk'), package: 'com.github.uiautomator', name: 'app-uiautomator.apk' },
            { path: path.join(assetsPath, 'package', 'app-uiautomator-test.apk'), package: 'com.github.uiautomator.test', name: 'app-uiautomator-test.apk' },
            { path: path.join(assetsPath, 'package', 'ADBKeyboard.apk'), package: 'com.android.adbkeyboard', name: 'ADBKeyboard.apk' }
        ]
    }
}
