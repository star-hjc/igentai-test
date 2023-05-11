<template>
    <div class="run-case-container">
        <div>
            <span>脚本：</span>
            <span>{{ state.device.title }}</span>
        </div>
        <el-input style="width: 150px;" v-model="state.device.id" placeholder="无设备..." disabled />
        <el-input-number v-model="runNum" :min="1" :disabled="isRun.value" />
        <el-button @click="onRunCase" :disabled="isRun.value">运行</el-button>
        <div class="state" v-show="runs > 0">
            <el-tag>已运行数：{{ runs }}</el-tag>
            <el-tag type="success">成功次数：{{ runs - errNum }}</el-tag>
            <el-tag type="danger">失败次数：{{ errNum }}</el-tag>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const runNum = ref(1)
const errNum = ref(0)
const runs = ref(0)
const isRun = ref(false)

const state = reactive({
    menuData: [],
    connectionMethod: 'adb',
    device: { id: '', path: '', ip: '', port: 6666, method: '', methodName: '', baudRate: 115200 }
})
onMounted(() => {
    state.device = { ...(useRoute().query) || {} }
})

async function onRunCase () {
    errNum.value = 0
    runs.value = 0
    const code = await appApi.readFile(state.device.filePath) || ''
    for (let i = 0; i < runNum.value; i++) {
        runs.value += 1
        ElMessage.success(`运行第${runs.value}次...`)
        await onRunOneCase(code).then(v => { if (!v) errNum.value += 1 })
    }
    ElMessage.success('运行完成...')
}

async function onRunOneCase (code) {
    let result = true
    try {
        await run(code, { ...state.device }).then(() => { result = true })
    } catch (error) {
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

    .state {
        height: 25xp;
        display: flex;
        gap: 15px;
        align-items: center;
        justify-content: space-between;
    }
}
</style>
