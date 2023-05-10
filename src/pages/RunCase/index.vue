<template>
    <div class="run-case-container">
        <el-select v-model="state.device.id" placeholder="选择设备..." @visibleChange="onDeviceIdChange"
            :loading="deviceListLoading" loadingText="加载中..." @change="onSelectDevice($event, 'adb')">
            <el-option v-for="item in state.deviceList" :key="item.device_id" :value="item.device_id">
                <div style="display: flex;justify-content: space-between;gap: 20px;">
                    <span>{{ item.device_id }}</span>
                    <span style="color: var(--el-text-color-secondary);">
                        {{ item.device }}
                    </span>
                </div>
            </el-option>
        </el-select>
        <el-input-number v-model="runNum" :min="1" />
        <el-button @click="onRunCase">运行</el-button>
    </div>
</template>

<script setup>
const deviceListLoading = ref(false)
const runNum = ref(1)
onMounted(() => {
    getDeviceList()
})

const state = reactive({
    menuData: [],
    connectionMethod: 'adb',
    device: { id: '', path: '', ip: '', port: 6666, method: '', methodName: '', baudRate: 115200 }
})

async function getDeviceList () {
    await adb.getDevices().then(data => {
        state.deviceList = data
    }).catch(() => {
        ElMessage.error('获取设备失败.')
    })
}

async function onDeviceIdChange (show) {
    if (show) {
        deviceListLoading.value = true
        await getDeviceList()
        deviceListLoading.value = false
    }
}

function onSelectDevice (val, method) {
    adb.getInitNotExistFile({ ...state.device }).then(data => {
        state.initNotExistFile = data
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

async function onRunCase () {
    let result = true
    try {await run(`console.log(await adb.getUI();)`,{...state.device}).then(()=>{ result = true })}
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        result = false
    }
return result
}
</script>

<style lang='scss' scoped>
.run-case-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 15px;
}
</style>
