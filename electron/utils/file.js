const fs = require('fs')
const cp = require('child_process')
const path = require('path')

module.exports = { isDirectorySync, renameFileSync, readdirAllSync, createFileSync, lstatSync, createFolderSync, removeFileSync, getImgBase64Sync, openFileExplorerSync, readFileSync, writeFileSync }

/**
 * 是否是文件夹
 * true:是文件夹 false:不是文件夹或路径不存在
 * @param {String} filePath 文件路径
 * @returns {Boolean}
 */
function isDirectorySync (filePath) {
    try {
        const stat = lstatSync(filePath)
        return stat.isDirectory()
    } catch (err) {
        return false
    }
}

/**
 * 是否是路径
 * true:是路径 false:路径不存在
 * @param {String} filePath 文件路径
 * @returns {Boolean}
 */
function lstatSync (filePath) {
    try {
        return fs.lstatSync(filePath)
    } catch (err) {
        return
    }
}

/**
 * 获取基础文件夹路径（如果路径是文件夹返回文件夹路径，文件则返回上一级文件夹）
 * @param {String} filePath 文件路径
 * @returns {String}
 */
function getBasePath (filePath) {
    return isDirectorySync(filePath) ? filePath : path.join(filePath, '..')
}

/**
 * 读取文件夹所有文件
 * @param {String} folderBasePath 文件夹路径
 * @returns {Arrer}
 */
function readdirAllSync (folderBasePath) {
    if (!isDirectorySync(folderBasePath)) return []
    return fs.readdirSync(folderBasePath).map(item => {
        const childrenPath = path.join(folderBasePath, item)
        if (isDirectorySync(childrenPath)) {
            return { type: 'folder', title: item, children: readdirAllSync(childrenPath), path: childrenPath }
        }
        const { ctime, mtime, birthtime } = fs.statSync(childrenPath)
        return {
            type: 'document',
            title: item,
            path: childrenPath,
            createTime: (birthtime || ctime).toLocaleString(),
            updateTime: new Date(Math.max(ctime, mtime)).toLocaleString()
        }
    }).filter(v => v)
}

/**
 * 创建文件
 * @param {String} filePath 文件路径
 * @param {String} fileName 文件名称
 * @param {String} content 文件内容
 * @param {Boolean} content 是否覆盖同名文件
 */
function createFileSync (filePath, fileName, content = '', cover = false) {
    if (!(/\.case$/.test(fileName))) return
    const baseFilePath = getBasePath(filePath)
    /** 不覆盖同名文件 存在同名文件 */
    if (!cover && fs.readdirSync(baseFilePath).indexOf(fileName) !== -1) {
        fileName = `${fileName.match(/^(.*)\.case$/)[1]}${new Date().getTime()}.case`
    }
    fs.writeFileSync(path.join(baseFilePath, fileName), content)
}

/**
 * 创建文件夹
 * @param {String} filePath 文件路径
 * @param {String} fileName 文件名称
 */
function createFolderSync (filePath, FolderName) {
    const baseFilePath = getBasePath(filePath)
    fs.mkdirSync(path.join(baseFilePath, FolderName))
}

/**
 * 删除文件、文件夹
 * @param {String} filePath 文件路径
 * @param {Boolean} recursive 强制删除带文件的文件夹
 */
function removeFileSync (filePath, recursive = false) {
    if (isDirectorySync(filePath)) {
        try {
            fs.rmdirSync(filePath, { recursive })
        } catch (err) {
            throw new Error('删除文件夹无效，请检测文件是否存在，或包含文件，包含文件需开启强制删除...')
        }
    } else {
        fs.unlinkSync(filePath)
    }
}

/**
 * 打开文件资源管理器
 * @param {String} filePath 文件路径
 */
async function openFileExplorerSync (filePath) {
    const baseFilePath = getBasePath(filePath)
    cp.exec(`start ${baseFilePath}`)
}

/**
 * 移动或重命名文件
 * @param {String} filePath 文件路径
 * @param {String} fileNameOrNewPath 新的文件名称或路径
 * @param {Boolean} move 是否移动文件
 * @returns
 */
function renameFileSync (filePath, fileNameOrNewPath, move = false) {
    if (!filePath || !fileNameOrNewPath) return
    if (move) {
        fs.renameSync(filePath, fileNameOrNewPath)
    } else {
        fs.renameSync(filePath, path.join(getBasePath(filePath), isDirectorySync(filePath) ? '../' : '', fileNameOrNewPath))
    }
}

/**
 * 读取文件
 * @param {String} filePath 文件路径
 * @returns
 */
function readFileSync (filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return reject('读取错误...')
            resolve(data)
        })
    })
}

function writeFileSync (filePath, data, cover = false) {
    try {
        if (fs.existsSync(filePath) && cover) {
            fs.appendFileSync(filePath, data)
            return true
        }
        fs.writeFileSync(filePath, data)
        return true
    } catch (err) {
        return false
    }
}

/**
 * 根据路径获取图标Base64
 * @returns base64
 */
function getImgBase64Sync (filePath) {
    try {
        return Buffer.from(fs.readFileSync(filePath)).toString('base64')
    } catch (error) {
        return
    }
}
