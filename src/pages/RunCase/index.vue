<template>
    <div class="run-case-container">
        <el-radio-group v-model="connectionMethod" style="margin: 15px 0 0 15px;">
            <el-radio-button label="one">单案例</el-radio-button>
            <el-radio-button label="multiple">多案例</el-radio-button>
        </el-radio-group>
        <div v-show="connectionMethod === 'one'">
            <span>脚本：</span>
            <span>{{ state.device.title }}</span>
        </div>
        <div v-show="connectionMethod === 'multiple'" style="padding: 0 25px;">
            <el-checkbox v-model="checkAll" label="全选" :indeterminate="isIndeterminate"
                @change="handleCheckAllChange">全选</el-checkbox>
            <el-checkbox-group v-model="checkedCities">
                <el-checkbox v-for="city in state.cities" :key="city" :label="city">{{ city }}</el-checkbox>
            </el-checkbox-group>
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
const checkAll = ref(false)
const runs = ref(0)
const isRun = ref(false)
const isIndeterminate = ref(true)
const checkedCities = ref([])
const connectionMethod = ref('one')
const state = reactive({
    cities: [],
    flies: [],
    menuData: [],
    device: { id: '', path: '', ip: '', port: 6666, method: '', methodName: '', baudRate: 115200 }
})
onMounted(async () => {
    state.device = { ...(useRoute().query) || {} }
    state.flies = ((await appApi.readdirCase(['png'], await appApi.getBasePath(state.device.filePath))) || []).filter(v => v.type === 'document')
    state.cities = state.flies.map(v => v.title)
})

function handleCheckAllChange (val) {
    checkedCities.value = val ? state.cities : []
    isIndeterminate.value = false
}

async function onRunCase () {
    isRun.value = true
    errNum.value = 0
    runs.value = 0
    let code = ''
    if (checkedCities.value?.length) {
        state.device.title = state.device.filePath?.split('\\')?.at(-2) || state.device.title
        const flies = state.flies.filter(v => checkedCities.value.includes(v.title))
        for (const item of flies) {
            code += `${await appApi.readFile(item.path)}\n\n\n\n`
        }
    } else {
        code = await appApi.readFile(state.device.filePath) || ''
    }
    await run(code, { ...state.device }, (num, result) => {
        ElMessage.success(`运行第${num}次...`)
        runs.value += 1
        if (!result) errNum.value += 1
    }, runNum.value)
    ElMessage.success('运行完成...')
    isRun.value = false
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
