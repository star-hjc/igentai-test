<template>
    <div class="screen-container">
        <div class="screen-tool">
            <el-button @click="getScreenshot({ ...state.device })" :loading="loading">刷新屏幕</el-button>
            <el-select v-if="state.imgBase64s?.length > 1" v-model="imgIndex" placeholder="选择" @change="onSelectImg">
                <el-option v-for="item, index in state.imgBase64s" :key="item.id" :label="`第${index + 1}张`"
                    :value="index" />
            </el-select>
            <div>
                <span>最大存储数量：</span>
                <el-input-number v-model="num" :min="1" :max="10" controls-position="right" @change="onSelectNum" />
            </div>

        </div>
        <el-scrollbar class="img-container" view-class="img-center">
            <img ref="imgRef" :src="imgBase64" />
            <div ref="contentBorderRef" class="content-border"></div>
        </el-scrollbar>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const imgBase64 = ref('')
const imgIndex = ref(0)
const imgRef = ref(null)
const contentBorderRef = ref(null)
const num = ref(5)
const loading = ref(false)
const state = reactive({
    device: {
        baudRate: undefined,
        filePath: '',
        methodName: '',
        method: '',
        id: '',
        path: ''
    },
    imgBase64s: []
})

appApi.ipcRenderer.on('call-onNodeClick-event', (event, data) => {
    if (!imgRef.value) return
    const { x, y, clientWidth, clientHeight, naturalHeight, naturalWidth } = imgRef.value
    const widthRatio = clientWidth / naturalWidth
    const heightRatio = clientHeight / naturalHeight
    contentBorderRef.value.style.top = `${y + ((data[1] || 0) * heightRatio)}px`
    contentBorderRef.value.style.left = `${x + ((data[0] || 0) * widthRatio)}px`
    contentBorderRef.value.style.width = `${widthRatio * ((data[2] || 0) - (data[0] || 0))}px`
    contentBorderRef.value.style.height = `${(widthRatio * ((data[3] || 0) - (data[1] || 0)))}px`
})

onresize = function () {
    contentBorderRef.value.style.top = '-99999px'
    contentBorderRef.value.style.left = '-99999px'
}

onMounted(async () => {
    const device = { ...(useRoute().query) || {}, baudRate: parseInt(useRoute()?.query?.baudRate || 0) }
    state.device = device
    const { width, height } = await adb.getScreenInfo(device)
    if (width > height) {
        imgRef.value.style.width = '99%'
    }
    if (height > width) {
        imgRef.value.style.height = '99%'
    }
    getScreenshot(device)
})

function onSelectImg (index) {
    imgBase64.value = state.imgBase64s[index].data
}
function onSelectNum (index) {
    if (state.imgBase64s?.length > index) {
        state.imgBase64s.splice(0, state.imgBase64s.length - index)
        imgIndex.value = (state.imgBase64s.length || 1) - 1
    }
}

function getScreenshot (device) {
    contentBorderRef.value.style.top = '-99999px'
    contentBorderRef.value.style.left = '-99999px'
    loading.value = true
    adb.getScreenshot(device).then(data => {
        imgBase64.value = data
        if (state.imgBase64s?.length >= num.value) state.imgBase64s.shift()
        const id = window.crypto.randomUUID()
        state.imgBase64s.push({ id, data })
        imgIndex.value = (state.imgBase64s.length || 1) - 1
        loading.value = false
    }).catch(() => {
        loading.value = false
    })
}
</script>

<style lang='scss' scoped>
.screen-container {
    height: 100vh;
    width: 100%;

    .screen-tool {
        height: 50px;
        box-sizing: border-box;
        border-bottom: 1px solid #e8e8e8;
        padding: 0 15px;
        display: flex;
        white-space: nowrap;
        align-items: center;
        gap: 15px;
    }

    .img-container {
        box-sizing: border-box;
        height: calc(100vh - 50px);

        :deep(.img-center) {
            height: calc(100vh - 50px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-border {
            position: fixed;
            z-index: 999;
            border: 1px solid red;
            top: -99999px;
            left: -99999px;
        }
    }
}
</style>
