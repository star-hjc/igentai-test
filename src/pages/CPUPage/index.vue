<template>
    <div>
        <div class="btn-box">
            <el-select style="margin-right:10px;" v-model="selectDevice" placeholder="选择连接的设备" size="large"
                @visibleChange="onShowOptions" :loadingText="loadingText" remoteShowSuffix>
                <el-option v-for="item in state.devices" :key="item.device_id" :label="`${item.device} - ${item.device_id}`"
                    :value="item.device_id" />
            </el-select>

            获取数量:<el-input style="width: 50px;margin: 0 10px;" v-model="num" placeholder="获取数量" />
            间隔时间:<el-input style="width: 50px;margin: 0 10px;" v-model="inter" placeholder="间隔时间" />
            <el-button type="primary" @click="begin" :disabled="getState">开始获取</el-button>
            <el-button type="primary" @click="stop" :disabled="!getState">停止</el-button>
            <span style="margin-left:10px;">串口：</span>
            <el-select style="margin-right:10px;" v-model="selectUSB" placeholder="选择连接的设备" size="large"
                @visibleChange="onShowUsbOptions" :loadingText="loadingText" remoteShowSuffix>
                <el-option v-for="item in state.serialPortList" :key="item.path" :label="item.path" :value="item.path" />
            </el-select>
            波特率:<el-input style="width: 68px;margin: 0 10px;" v-model="baudRate" placeholder="波特率" />
            <el-button type="primary" @click="begin('a72')" :disabled="getStateA72">linux开始获取</el-button>
            <el-button type="primary" @click="stop('a72')" :disabled="!getStateA72">linux停止</el-button>
            <el-dropdown style="margin-left:100px;">
                    <el-button style="margin-left:15px;" type="primary">功能</el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="exportExcle">导出为Excel</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
        </div>
        <div class="view-content">
            <div class="left">
                <div class="tool adb">
                    <el-button type="primary" @click="fullScreen('cpu')">全屏</el-button>
                </div>
                <CPU ref="cpuDOM" class="cpu" />
                <div class="tool a72">
                    <el-button type="primary" @click="fullScreen('cpua72')">全屏</el-button>
                </div>
                <CPUA72 ref="cpua72DOM" class="cpu" />
            </div>
            <div class="rigth">
                <div class="tool adb">
                    <el-button type="primary" @click="fullScreen('cpuzma72')">全屏</el-button>
                </div>
                <CPUZX ref="cpuzmDOM" class="cpu-zx" />
                <div class="tool a72">
                    <el-button type="primary" @click="fullScreen('cpuzm')">全屏</el-button>
                </div>
                <CPUZXA72 ref="cpuzma72DOM" class="cpu-zx" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, reactive, onUpdated } from 'vue'
import CPU from './cpu.vue'
import CPUZX from './cpu-zx.vue'
import CPUA72 from './cpu-linux.vue'
import CPUZXA72 from './cpu-zx-linux.vue'
const getState = ref(false)
const getStateA72 = ref(false)
const loadingText = ref('')
const selectDevice = ref('')
const selectUSB = ref('')
const baudRate = ref(115200)
const num = ref(10)
const inter = ref(5)
const cpuDOM = ref(null)
const cpuzmDOM = ref(null)
const cpua72DOM = ref(null)
const cpuzma72DOM = ref(null)
onUpdated(() => {
})

onMounted(async () => {
    adb.getDevices().then((data) => {
        state.devices = data || []
    })
    appApi.getSerialPortList().then((data) => {
        state.serialPortList = data || []
    })

    window.onresize = function () {
        chartResize()
    }
})
function chartResize () {
    cpuDOM.value.chartResize()
    cpuzmDOM.value.chartResize()
    cpua72DOM.value.chartResize()
    cpuzma72DOM.value.chartResize()
}

function exportExcle () {
    ElMessage('功能开发中...')
}

const state = reactive({
    devices: [],
    serialPortList: []
})

function fullScreen (key = 'cpuzm') {
    const elDOMs = { cpu: cpuDOM.value, cpua72: cpua72DOM.value, cpuzma72: cpuzma72DOM.value, cpuzm: cpuzmDOM.value }
    const elDOM = elDOMs[key] || elDOMs.cpuzm
    elDOM.$el.requestFullscreen()
    setTimeout(() => {
        elDOM.chartResize()
    }, 500)
}
document.addEventListener('fullscreenchange', isExitFullscreen)

function isExitFullscreen () {
    if (!document.fullscreenElement) {
        chartResize()
    }
}
function begin (type) {
    if (type === 'a72') {
        if (!selectUSB.value) return ElMessage.error('串口不能为空...')
        if (!baudRate.value) return ElMessage.error('波特率不能为空...')
        getStateA72.value = true
        cpuApi.runA72ProcTask({ path: selectUSB.value, baudRate: Number(baudRate.value) }, num.value || 10, inter.value || 5)
        return
    }
    if (!selectDevice.value) return ElMessage.error('设备号不能为空...')
    getState.value = true
    cpuApi.runProcTask(selectDevice.value, num.value || 10, inter.value || 5)
}

function stop (type) {
    if (type === 'a72') {
        getStateA72.value = false
        cpuApi.stopA72ProcTask()
        return
    }
    getState.value = false
    cpuApi.stopProcTask()
}

async function onShowOptions (isShow) {
    loadingText.value = '加载连接设备中...'
    if (isShow) {
        state.devices = (await adb.getDevices()) || []
    }
}

async function onShowUsbOptions (isShow) {
    loadingText.value = '加载连接设备中...'
    if (isShow) {
        state.serialPortList = (await appApi.getSerialPortList()) || []
    }
}
</script>

<style lang='scss' scoped>
.btn-box {
    height: 80px;
    display: flex;
    align-items: center;
    padding: 0 2;
}

.view-content {
    height: calc(100vh - 80px);
    overflow: hidden;
    width: 100vw;
    display: flex;
    gap: 10px;

    .left,
    .rigth {
        width: 50vw;
        height: 100%;

        .tool {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .adb::before {
            content: 'ADB';
            position: absolute;
            left: 10px;
        }

        .a72::before {
            content: 'linux';
            position: absolute;
            left: 10px;
        }
    }

    .left {
        .cpu {
            height: calc(50% - 40px);
        }
    }

    .rigth {
        .cpu-zx {
            height: calc(50% - 40px);
        }
    }
}
</style>
