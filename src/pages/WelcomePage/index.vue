<template>
    <div class="welcome" @click="onCloseRightClickMenu">
        <el-container class="welcome-container">
            <el-header height="var(--header-height)">
                <div class="tool" @click="onRefresh">
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
                                <RightClickMenuItem label="刷新" @click="onRefresh" />
                                <RightClickMenuItem label="重命名" @click="onRenameFile" />
                                <RightClickMenuItem label="删除" @click="onRemoveFile" />
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

                            <div class="local work-area-item">
                                <div class="title">
                                    <span class="top">本机：</span>
                                    <el-button @click="getLocalIPv4">刷新</el-button>
                                </div>
                                <div class="content">
                                    <div class="content-item">
                                        <span>本机IPv4：</span>
                                        <span> {{ state.ipv4?.join(' , ') }}</span>
                                    </div>
                                    <div v-if="state.ipInfo.ip" class="content-item">
                                        <span>网络根IPv4：</span>
                                        <span> {{ state.ipInfo.ip }}</span>
                                    </div>
                                    <div v-if="state.ipInfo.actionAddress?.length" class="content-item">
                                        <span>所在地：</span>
                                        <span> {{ state.ipInfo.actionAddress?.join(' , ') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="device work-area-item">
                                <div class="title">
                                    <span class="top">设备：</span>
                                    <el-button v-if="state.device.id || state.device.path"
                                        @click="onLinkTest">测试连接</el-button>
                                </div>
                                <el-radio-group v-model="state.connectionMethod" @change="onSwitchConnectionMethod"
                                    style="margin: 15px 0 0 15px;">
                                    <el-radio-button label="adb">ADB</el-radio-button>
                                    <el-radio-button label="serialport">SerialPort</el-radio-button>
                                </el-radio-group>
                                <div class="content">
                                    <div class="content-item" style="color: #E6A23C;"
                                        v-show="state.connectionMethod === 'serialport'">(不建议使用)</div>
                                    <div class="content-item">
                                        <div v-show="state.connectionMethod === 'serialport'">
                                            <span>串口：</span>
                                            <el-select v-model="state.device.path" placeholder="选择串口..."
                                                @visibleChange="onPathChange" :loading="serialPortListLoading"
                                                loadingText="加载中..." @change="onSelectDevice($event, 'serialport')">
                                                <el-option v-for="item in state.serialPortList" :key="item.path"
                                                    :value="item.path" />
                                            </el-select>
                                        </div>
                                        <div v-show="state.connectionMethod === 'serialport'">
                                            <span style="margin-left: 20px;">波特率：</span>
                                            <el-select v-model="state.device.baudRate" placeholder="选择波特率...">
                                                <el-option v-for="item in state.baudRateList" :key="item" :value="item" />
                                            </el-select>
                                        </div>
                                        <div v-show="state.connectionMethod === 'adb'">
                                            <span>设备：</span>
                                            <el-select v-model="state.device.id" placeholder="选择设备..."
                                                @visibleChange="onDeviceIdChange" :loading="deviceListLoading"
                                                loadingText="加载中..." @change="onSelectDevice($event, 'adb')">
                                                <el-option v-for="item in state.deviceList" :key="item.device_id"
                                                    :value="item.device_id">
                                                    <div style="display: flex;justify-content: space-between;gap: 20px;">
                                                        <span>{{ item.device_id }}</span>
                                                        <span style="color: var(--el-text-color-secondary);">
                                                            {{ item.device }}
                                                        </span>
                                                    </div>
                                                </el-option>
                                            </el-select>
                                        </div>
                                        <div v-show="state.connectionMethod === 'adb'">
                                            <el-input style="margin-left: 20px;" v-model="state.device.port"
                                                placeholder="输入端口..." :disabled="state.device.method === 'wifi'">
                                                <template #prepend>服务端口：</template>
                                            </el-input>
                                        </div>
                                    </div>
                                    <div class="content-item" v-if="state.initNotExistFile.packages?.length">
                                        <div> 未安装的包：</div>
                                        <div>
                                            <el-tag v-for="item in state.initNotExistFile?.packages" :key="item">
                                                {{ item }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="content-item" v-if="state.initNotExistFile.files?.length">
                                        <div> 未安装的二进制文件：</div>
                                        <div>
                                            <el-tag v-for="item in state.initNotExistFile.files" :key="item">
                                                {{ item }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div class="content-item"
                                        v-if="state.initNotExistFile.packages?.length || state.initNotExistFile.files?.length">
                                        <el-button type="primary" @click="installInitExistFile">补入安装</el-button>
                                    </div>
                                </div>
                            </div>

                            <div class="fun work-area-item">
                                <div class="title"><span class="top">功能：</span></div>
                                <div class="content">
                                    <div class="content-item">
                                        <el-button @click="openRunCase" :disabled="!isLink">运行</el-button>
                                        <el-button @click="openWorkBenches">编写</el-button>
                                        <el-button type="danger" @click="onRemoveFile">删除</el-button>
                                    </div>
                                    <div class="content-item">
                                        <el-input class="wifi-port" v-model="state.wifiPort" placeholder="输入端口...">
                                            <template #prepend>端口：</template>
                                            <template #append>
                                                <el-button type="primary" @click="onSwitchWiFiADB">切换WIFI-ADB</el-button>
                                            </template>
                                        </el-input>
                                    </div>

                                    <div class="content-item">
                                        <el-button type="warning" @click="onKillADB">停止当前ADB服务</el-button>
                                        <el-button type="warning" @click="onKillADB(true)">停止所有ADB服务</el-button>
                                    </div>
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
const serialPortListLoading = ref(false)
const deviceListLoading = ref(false)
const isLink = ref(false)
const state = reactive({
    menuData: [],
    /** adb,serialport */
    connectionMethod: 'adb',
    device: { id: '', path: '', ip: '', port: 6666, method: '', methodName: '', baudRate: 115200 },
    wifiPort: 8848,
    ipv4: [],
    ipInfo: { ip: '', actionAddress: [] },
    deviceList: [],
    serialPortList: [],
    baudRateList: [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000, 921600],
    rightClickMenu: {
        isShow: false,
        position: []
    },
    initNotExistFile: {},
    file: null,
    caseBasePath: '',
    rightFile: null
})

onMounted(async () => {
    state.caseBasePath = await appApi.getAssetsPath('case')
    getCase()
    getDeviceList()
    getLocalIPv4()
})

async function getIpInfo () {
    await appApi.getIpInfo().then(data => {
        console.log(data)
        state.ipInfo = data
    })
}

async function onLinkTest () {
    ElMessage.success('连接中...')
    const device = { ...state.device }
    await adb.startATXService(device)
    adb.getAtxVersion(device).then(() => {
        ElMessage.success('连接成功...')
    }).catch(() => {
        ElMessage.error('连接失败...')
    })
}

function onRefresh () {
    location.reload()
}

async function getLocalIPv4 () {
    await appApi.getLocalIPv4().then(data => {
        state.ipv4 = data
    })
    getIpInfo()
}

async function getCase () {
    await appApi.readdirCase().then(data => {
        state.menuData = data
    })
}

async function getSerialPortList () {
    await appApi.getSerialPortList().then(data => {
        state.serialPortList = data
    }).catch(() => {
        ElMessage.error('获取串口失败.')
    })
}

async function getDeviceList () {
    await adb.getDevices().then(data => {
        state.deviceList = data
    }).catch(() => {
        ElMessage.error('获取设备失败.')
        isLink.value = false
    })
}

function onCloseRightClickMenu () {
    state.rightClickMenu.isShow = false
}
async function onSwitchWiFiADB () {
    const device = { ...state.device }
    if (!device.id) return ElMessage.warning('请选择设备ID...')
    const { inetaddr } = (await adb.getWiFiIP(device)) || {}
    if (!inetaddr) return ElMessage.warning('获取设备IP失败，请检测设备是否连接WIFI...')
    // if (state.ipv4.indexOf(inetaddr) === -1) return ElMessage.warning(`请检测与设备是否连接同一个WiFi，当前设备IPv4：${inetaddr}`)
    const success = await adb.switchWiFiADB(device, `${inetaddr}:${state.wifiPort}`)
    if (success) {
        ElMessage.success('切换wifiADB成功')
        getDeviceList()
    }
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
    if (val === 'adb') {
        state.device.path = ''
        getDeviceList()
    }
    if (val === 'serialport') {
        state.device.id = ''
        getSerialPortList()
    }
}

function onClickFile (e, item) {
    state.file = item
    if (state.connectionMethod === 'adb') {
        state.path = ''
        getDeviceList()
    }
    if (state.connectionMethod === 'serialport') {
        state.device.id = ''
        getSerialPortList()
    }
}
function openRunCase () {
    if (!state.device.id && !state.device.path) return ElMessage.warning('请选择连接的设备...')
    viewApi.createRunCaseWindow({ ...state.device, filePath: state.file.path, title: state.file?.title })
}

function openWorkBenches () {
    if (!state.device.id && !state.device.path) return ElMessage.warning('请选择连接的设备...')
    viewApi.createWorkBenchesWindow({ ...state.device, filePath: state.file.path })
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

async function onKillADB (all = false) {
    ElMessage.success('重启ADB服务中...')
    if (all) {
        await appApi.killServerByPname()
    } else {
        await adb.killServer()
    }
    ElMessage.success('重启ADB服务成功.')
}

function onRenameFile () {
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

function onRemoveFile () {
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

async function onPathChange (show) {
    if (show) {
        serialPortListLoading.value = true
        await getSerialPortList()
        serialPortListLoading.value = false
    }
}

async function onDeviceIdChange (show) {
    if (show) {
        deviceListLoading.value = true
        await getDeviceList()
        deviceListLoading.value = false
    }
}

async function installInitExistFile () {
    ElMessage.success('补入安装中...')
    const { device, initNotExistFile } = state
    const packages = [...(initNotExistFile.packages || [])]
    const files = [...(initNotExistFile.files || [])]
    await adb.installInitExistFile({ ...device }, { packages, files }).then(data => {
        state.initNotExistFile = data
        ElMessage.success('安装成功...')
    }).catch(() => {
        ElMessage.error('安装失败...')
    })
}

function onSelectDevice (val, method) {
    const device = { ...state.device }
    if (method === 'adb') {
        adb.getInitNotExistFile(device).then(data => {
            if (data.files?.length && data.packages?.length) {
                state.initNotExistFile = data
                isLink.value = true
                return
            }
            adb.installInitExistFile(device, data).then((notExistFile) => {
                state.initNotExistFile = notExistFile
                isLink.value = true
            })
        })
        if (/^\s*\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b:\d{1,5}\s*$/.test(val)) {
            state.device.methodName = 'WIFI'
            state.device.method = 'wifi'
            state.device.ip = state.device.id.split(':')[0]
            state.device.port = '7912'
            return
        }
        state.device.methodName = 'USB'
        state.device.method = 'usb'
        return
    }
    state.device.methodName = '串口'
    state.device.method = method
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

                    .info .content,
                    .local .content {
                        font-size: 12px;
                    }

                    .device .content {
                        .content-item {
                            display: flex;
                            align-items: center;
                            white-space: nowrap;
                        }
                    }

                    .fun .content {
                        .content-item {
                            display: flex;
                            gap: 15px;

                            .wifi-port {
                                width: 270px;
                                min-width: 270px;

                                :deep(.el-input-group__prepend) {
                                    color: #ffffff;
                                    background-color: #409eff;
                                }

                                .el-button {
                                    display: inline-flex;
                                    justify-content: center;
                                    align-items: center;
                                    line-height: 1;
                                    height: 32px;
                                    white-space: nowrap;
                                    cursor: pointer;
                                    color: var(--el-button-text-color);
                                    text-align: center;
                                    box-sizing: border-box;
                                    outline: 0;
                                    transition: .1s;
                                    font-weight: var(--el-button-font-weight);
                                    -webkit-user-select: none;
                                    -moz-user-select: none;
                                    -ms-user-select: none;
                                    user-select: none;
                                    vertical-align: middle;
                                    -webkit-appearance: none;
                                    background-color: var(--el-button-bg-color);
                                    border: var(--el-border);
                                    border-color: var(--el-button-border-color);
                                    padding: 8px 15px;
                                    font-size: var(--el-font-size-base);
                                    border-radius: var(--el-border-radius-base);
                                    border-top-left-radius: 0;
                                    border-bottom-left-radius: 0;
                                }

                                .el-button:focus,
                                .el-button:hover {
                                    color: var(--el-button-hover-text-color);
                                    border-color: var(--el-button-hover-border-color);
                                    background-color: var(--el-button-hover-bg-color);
                                    outline: 0;
                                }
                            }
                        }
                    }

                    .work-area-item {
                        border: 1px solid #e8e8e8;

                        .link:hover {
                            color: var(--el-color-primary);
                            cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
                        }

                        .title {
                            height: 36px;
                            display: flex;
                            align-items: center;
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

                    .el-button+.el-button {
                        margin: 0;
                    }
                }
            }

        }

    }
}
</style>
