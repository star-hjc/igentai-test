<template>
    <div class="welcome" @click="onCloseRightClickMenu">
        <el-container class="welcome-container">
            <el-header height="var(--header-height)">
                <div class="tool">
                    <el-icon size="45">
                        <House />
                    </el-icon>
                    <span>首页</span>
                </div>
                <div class="tool">
                    <el-icon size="45">
                        <Cpu />
                    </el-icon>
                    <span>CPU监控</span>
                </div>
                <div class="tool" @click="switchDevtools">
                    <el-icon size="45">
                        <SetUp />
                    </el-icon>
                    <span>开发者模式</span>
                </div>
            </el-header>
            <el-container>
                <el-aside>
                    <div class="menu-header">
                        脚本列表
                    </div>
                    <el-scrollbar>
                        <el-menu @contextmenu.prevent="onRightClickMenu">
                            <MenuItem :menuData="state.menuData" :defaultProps="{ icon: 'type', index: 'path' }"
                                @clickFile="onClickFile" @rightClick="onRightClickMenu" />
                            <RightClickMenu ref="RightClickMenuRef" :show="state.rightClickMenu.isShow"
                                :position="state.rightClickMenu.position">
                                <RightClickMenuItem label="新建脚本文件" @click="createFile" />
                                <RightClickMenuItem label="新建脚本文件夹" @click="createFolder" />
                                <RightClickMenuItem label="在文件资源管理器中显示" @click="openFileExplorer()" />
                                <RightClickMenuItemGroup />
                                <RightClickMenuItem label="重命名" @click="renameFile" />
                                <RightClickMenuItem label="删除" @click="removeFile" />
                            </RightClickMenu>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-main>
                    <div v-if="!state.file" class="welcome">Welcome&nbsp;IGENTAI-TEST!</div>
                    <div v-else class="work-area">
                        <el-scrollbar>
                            <div class="info work-area-item">
                                <div class="title"><span class="top">脚本：</span> {{ state.file?.title }}</div>
                                <div class="content">
                                    <div class="content-item">
                                        <span>创建时间：</span>
                                        <span> {{ state.file?.createTime || '未知' }}</span>
                                    </div>
                                    <div class="content-item">
                                        <span>修改时间：</span>
                                        <span> {{ state.file?.updateTime || '未知' }}</span>
                                    </div>
                                    <div class="content-item" @click="openFileExplorer(state.file?.path)">
                                        <span>文件路径：</span>
                                        <span class="link">{{ state.file.path }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="device work-area-item">
                                <div class="title"><span class="top">设备区</span></div>
                                <el-radio-group v-model="state.connectionMethod" @change="onSwitchConnectionMethod"
                                    style="margin: 15px 0 0 15px;">
                                    <el-radio-button label="usb">USB</el-radio-button>
                                    <el-radio-button label="wifi">WIFI</el-radio-button>
                                    <el-radio-button label="serialport">SerialPort</el-radio-button>
                                </el-radio-group>
                                <div class="content">
                                    <span v-show="['usb', 'wifi'].includes(state.connectionMethod)">设备：</span>
                                    <span v-show="state.connectionMethod === 'serialport'">串口：</span>
                                    <el-select v-model="state.device"
                                        :placeholder="state.connectionMethod === 'serialport' ? '选择串口...' : '选择设备...'">
                                        <el-option v-for="item in state.deviceList" :key="item.device_id"
                                            :value="item.device_id">
                                            <div style="display: flex;justify-content: space-between;gap: 20px;">
                                                <span>{{ item.device_id }}</span>
                                                <span style=" color: var(--el-text-color-secondary);">
                                                    {{ item.device }}
                                                </span>
                                            </div>
                                        </el-option>
                                    </el-select>
                                    <span v-show="state.connectionMethod === 'serialport'"
                                        style="margin-left: 20px;">波特率：</span>
                                    <el-select v-show="state.connectionMethod === 'serialport'" v-model="state.baudRate"
                                        placeholder="选择波特率...">
                                        <el-option v-for="item in state.baudRateList" :key="item" :label="item"
                                            :value="item" />
                                    </el-select>
                                </div>
                            </div>

                            <div class="fun work-area-item">
                                <div class="title"><span class="top">功能区</span></div>
                                <div class="content">
                                    <el-button>运行</el-button>
                                    <el-button @click="openWorkBenches">编写</el-button>
                                    <el-button type="danger" @click="removeFile">删除</el-button>
                                </div>
                            </div>
                            <!-- 判断是否运行 -->
                            <div class="log work-area-item">
                                <div class="title"><span class="top">日志：</span></div>
                                <div class="content">
                                    开发中...
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
const RightClickMenuRef = ref(null)
const state = reactive({
    menuData: [],
    /** usb,wifi,serialport */
    connectionMethod: 'usb',
    device: '',
    deviceList: [],
    baudRate: 115200,
    baudRateList: [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000],
    rightClickMenu: {
        isShow: false,
        position: []
    },

    file: null,
    caseBasePath: '',
    rightFile: null
})

onMounted(async () => {
    state.caseBasePath = await appApi.getAssetsPath('case')
    getCase()
    getDeviceList()
})

async function getCase () {
    await appApi.readdirCase().then(data => {
        state.menuData = data
    })
}

async function getSerialPortList () {
    await appApi.getSerialPortList().then(data => {
        console.log(data)
        state.deviceList = data
    }).catch(() => {
        ElMessage.error('获取串口失败.')
    })
}

async function getDeviceList () {
    await adb.getDevices().then(data => {
        state.deviceList = data
    }).catch(() => {
        ElMessage.error('获取设备失败.')
    })
}

function onCloseRightClickMenu () {
    state.rightClickMenu.isShow = false
}

function onRightClickMenu (e, item) {
    state.rightFile = item
    state.rightClickMenu.isShow = true
    nextTick(() => {
        // eslint-disable-next-line no-console
        console.log(RightClickMenuRef.value.$el.clientWidth)
        state.rightClickMenu.position = [`${e.clientX + 20}px`, `${e.clientY + 20}px`]
    })
}

function onSwitchConnectionMethod (val) {
    if (['usb', 'wifi'].includes(val)) {
        getDeviceList()
    }
    if (val === 'serialport') {
        getSerialPortList()
    }
}

function onClickFile (e, item) {
    state.file = item
    if (['usb', 'wifi'].includes(state.connectionMethod)) {
        getDeviceList()
    }
    if (state.connectionMethod === 'serialport') {
        getSerialPortList()
    }
}

function openWorkBenches () {
    appApi.createWorkBenchesWindow()
}

function switchDevtools () {
    appApi.switchDevtools()
}

function openFileExplorer (filePath) {
    appApi.openFileExplorer(filePath || (state.rightFile?.path || state.caseBasePath))
}

function createFile () {
    ElMessageBox.prompt(
        `输入文件名称（不需要后缀 “.case”）`,
        `新建文件`, {
            confirmButtonText: '创建',
            cancelButtonText: '取消创建'
        })
        .then(async ({ value: fileName }) => {
            await appApi.createFile(state.rightFile?.path || state.caseBasePath, `${fileName}.case`)
            getCase()
        })
        .catch(() => { })
}

function createFolder () {
    ElMessageBox.prompt(
        `输入文件夹名称`,
        `新建文件夹`, {
            confirmButtonText: '创建',
            cancelButtonText: '取消创建'
        })
        .then(async ({ value: folderName }) => {
            await appApi.createFolder(state.rightFile?.path || state.caseBasePath, folderName)
            getCase()
        })
        .catch(() => { })
}
function renameFile () {
    ElMessageBox.prompt(
        `输入新的名称`,
        `重命名`, {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        })
        .then(async ({ value }) => {
            await appApi.renameFile(state.rightFile?.path || state.caseBasePath, `${value}.case`)
            state.file = null
            getCase()
        })
        .catch(() => { })
}

function removeFile () {
    ElMessageBox.confirm(
        '确定删除该文件?',
        '删除',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'error',
            icon: markRaw(Delete)
        }
    ).then(async () => {
        if (state.rightFile?.children?.length) {
            ElMessageBox.confirm(
                '该文件夹包含多个文件，确定删除文件夹?',
                '删除',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'error',
                    icon: markRaw(Delete)
                }
            )
                .then(async () => {
                    await appApi.removeFile(state.rightFile.path, true)
                    getCase()
                })
                .catch(() => { })
        } else {
            await appApi.removeFile(state.rightFile.path)
            getCase()
        }
    }).catch(() => { })
}
</script>

<style lang='scss' scoped>
.welcome {
    --header-height: 88px;

    --main-height: calc(100vh - var(--header-height));

    --menu-container-height: calc(var(--main-height) - var(--el-menu-item-height));

    .welcome-container {
        height: 100vh;
        overflow: hidden;

        .el-header {
            display: flex;
            gap: 20px;
            background: #001529;

            .tool {
                color: #ffffff;
                width: var(--header-height);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                span {
                    margin-top: 5px;
                    font-size: 16px;
                }
            }

            .tool:hover {
                background: var(--el-color-primary-light-9);
                color: var(--el-color-primary);
            }
        }

        .el-aside {
            .menu-header {
                font-weight: bold;
                color: #ffffff;
                background: #409eff;
                text-align: center;
                line-height: var(--el-menu-item-height);
                height: var(--el-menu-item-height);
            }

            .el-scrollbar {
                height: var(--menu-container-height);

                .el-menu {
                    min-height: var(--menu-container-height);
                }
            }
        }

        .el-main {
            padding-right: 0;

            .welcome {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
            }

            .work-area {

                .el-scrollbar {
                    padding-right: var(--el-main-padding);
                    height: calc(var(--main-height) - 2 * var(--el-main-padding));

                    .info .content {
                        font-size: 12px;
                    }

                    .device .content {
                        display: flex;
                        align-items: center;
                        white-space: nowrap;
                    }

                    .work-area-item {
                        border: 1px solid #e8e8e8;

                        .link:hover {
                            color: var(--el-color-primary);
                            cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
                        }

                        .title {
                            height: 36px;
                            line-height: 36px;
                            font-weight: bold;
                            border-left: 3px solid var(--el-color-primary);
                            padding: 0 20px;
                            border-bottom: 1px solid #e8e8e8;

                            .top {
                                letter-spacing: 3px;
                            }
                        }

                        .content {
                            padding: 15px 35px;

                            .content-item+.content-item {
                                margin-top: 10px;
                            }
                        }
                    }

                    .work-area-item+.work-area-item {
                        margin-top: 20px;
                    }
                }
            }

        }

    }
}
</style>
