<template>
    <div class="screen-container">
        <div class="screen-tool">
            <el-button @click="getScreenshot({ ...state.device })" :loading="loading" type="primary">刷新屏幕</el-button>
            <el-select v-if="state.imgBase64s?.length > 1" v-model="imgIndex" placeholder="选择" @change="onSelectImg">
                <el-option v-for="item, index in state.imgBase64s" :key="item.id" :label="`第${index + 1}张`"
                    :value="index" />
            </el-select>
            <div>
                <el-checkbox v-model="isCrop" @click="omSwCrop">截图</el-checkbox>
                <el-checkbox v-model="isGetPosition">获取坐标</el-checkbox>
            </div>
            <div>
                <span>最大存储数量：</span>
                <el-input-number style="width: 75px;" v-model="num" :min="1" :max="10" controls-position="right"
                    @change="onSelectNum" />
            </div>
            <el-color-picker v-model="color" show-alpha />
            <el-button @click="onCrop">裁剪</el-button>
            <el-button @click="onRefresh">清空</el-button>
            <el-button @click="ongetCropRangeStr">获取截图范围</el-button>
        </div>
        <el-scrollbar class="img-container" view-class="img-center">
            <img ref="imgRef" :src="imgBase64" :draggable="!isCrop" @click="onImgClick" @mousedown="onSelectDown"
                @mouseup="onSelectUp" @mouseout="onSelectOut" />
            <div ref="contentBorderRef" :style="`border: 1px solid ${color};`" class="content-border"></div>
        </el-scrollbar>
        <el-dialog v-model="isSaveCrop" title="保存截图">
            <el-scrollbar ref="scrollbarRef" height="40vh"
                view-style="display: flex;justify-content: center;align-items: center;height:40vh;">
                <img ref="cropImgRef" :src="cropImgBase64" draggable="false" :style="`width:${cropImgSize}%;`" />
            </el-scrollbar>

            <el-slider v-model="cropImgSize" />
            <div style="display: flex;justify-content: center;align-items: center;padding: 10px;">
                <el-input v-model="cropImgName" />
                <el-button type="primary" style="margin: auto;" @click="onSaveCropImg">保存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
const imgBase64 = ref('')
const cropImgBase64 = ref('')
const cropImgSize = ref(21)
const imgIndex = ref(0)
const cropImgName = ref('')
const isCrop = ref(true)
const imgRef = ref(null)
const contentBorderRef = ref(null)
const isSaveCrop = ref(false)
const color = ref('rgba(255,0,0,1)')
const num = ref(5)
const isGetPosition = ref(false)
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
    contentBorder: [],
    imgBase64s: []
})

appApi.ipcRenderer.on('call-onNodeClick-event', (event, [bX, bY, toX, toY]) => {
    if (!imgRef.value) return
    const { x, y, clientWidth, clientHeight, naturalHeight, naturalWidth } = imgRef.value
    const widthRatio = clientWidth / naturalWidth
    const heightRatio = clientHeight / naturalHeight
    state.contentBorder[0] = bX
    state.contentBorder[1] = bY
    state.contentBorder[2] = Math.abs(bX - toY)
    state.contentBorder[3] = Math.abs(bY - toY)
    state.contentBorder[4] = x + ((bX || 0) * widthRatio)
    state.contentBorder[5] = y + ((bY || 0) * heightRatio)
    state.contentBorder[6] = widthRatio * ((toX - bX) || 0)
    state.contentBorder[7] = widthRatio * ((toY - bY) || 0)
    const contentBorder = state.contentBorder
    showContentBorder(contentBorder[4], contentBorder[5], contentBorder[6], contentBorder[7])
})

function omSwCrop () {
    if (isCrop.value) {
        contentBorderRef.value.style.top = '-99999px'
        contentBorderRef.value.style.left = '-99999px'
    }
}

function showContentBorder (x, y, width, height) {
    contentBorderRef.value.style.top = `${y}px`
    contentBorderRef.value.style.left = `${x}px`
    contentBorderRef.value.style.width = `${width}px`
    contentBorderRef.value.style.height = `${height}px`
}

function onRefresh () {
    location.reload()
}

async function onCrop () {
    cropImgName.value = new Date().getTime()
    if (state.contentBorder?.length < 8) return ElMessage.error('截图条件不满足')
    cropImgBase64.value = await appApi.cropImg(imgBase64.value, getCropRange())
    if (cropImgBase64.value) isSaveCrop.value = true
}

function ongetCropRangeStr () {
    if (state.contentBorder?.length < 8) return ElMessage.error('截图条件不满足')
    const data = getCropRange().map(v => Math.round(v)).join(',')
    navigator.clipboard.writeText(data)
    ElMessage.success(data)
}

function getCropRange () {
    const contentBorder = state.contentBorder
    const { naturalHeight, naturalWidth, x: oldX, y: oldY, width, height } = imgRef.value
    const ratioX = width / naturalWidth
    const ratioY = height / naturalHeight
    const x = (contentBorder[4] - oldX) / ratioX
    const y = (contentBorder[5] - oldY) / ratioY
    return [x, y, contentBorder[6] / ratioX, contentBorder[7] / ratioX]
}
async function onSaveCropImg () {
    const folderPath = await appApi.getBasePath(state.device.filePath)
    if (/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/.test(cropImgName.value)) {
        ElMessage.success('文件名不能为中文!')
        isSaveCrop.value = false
        return
    }
    appApi.downloadBase64(`${folderPath}\\${cropImgName.value}`, cropImgBase64.value).then(data => {
        if (data) return ElMessage.success('保存成功!')
        ElMessage.success('保存出现错误!')
    })
    isSaveCrop.value = false
}

function onSelecMove ({ pageX, pageY }) {
    state.contentBorder[2] = pageX - 1
    state.contentBorder[3] = pageY - 1
    const contentBorder = state.contentBorder
    state.contentBorder[4] = Math.min(contentBorder[0], contentBorder[2])
    state.contentBorder[5] = Math.min(contentBorder[1], contentBorder[3])
    state.contentBorder[6] = Math.abs(contentBorder[0] - contentBorder[2])
    state.contentBorder[7] = Math.abs(contentBorder[1] - contentBorder[3])
    showContentBorder(state.contentBorder[4], state.contentBorder[5], state.contentBorder[6], state.contentBorder[7])
}

function onSelectDown ({ pageX, pageY }) {
    if (!isCrop.value) return
    state.contentBorder[0] = pageX + 1
    state.contentBorder[1] = pageY + 1
    imgRef.value.addEventListener('mousemove', onSelecMove)
}

function onSelectUp ({ pageX, pageY }) {
    imgRef.value.removeEventListener('mousemove', onSelecMove)
}

function onSelectOut () {
    imgRef.value.removeEventListener('mousemove', onSelecMove)
}

onresize = function () {
    contentBorderRef.value.style.top = '-99999px'
    contentBorderRef.value.style.left = '-99999px'
}

onMounted(async () => {
    const device = { ...(useRoute().query) || {} }
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

function onImgClick ({ target: { width, height }, offsetX, offsetY }) {
    if (isGetPosition.value) {
        const { naturalHeight, naturalWidth } = imgRef.value
        const x = Math.round(naturalWidth * ((offsetX + 1) / width))
        const y = Math.round(naturalHeight * ((offsetY + 1) / height))
        navigator.clipboard.writeText(`${x},${y}`)
        ElMessage.success(`${x} , ${y}`)
    }
}

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
        appApi.onRefreshScreenshot()
    }).catch(() => {
        loading.value = false
    })
}
</script>

<style lang='scss' scoped>
.screen-container {
    height: 100vh;
    width: 100%;
    background: #f1f1f1;
    overflow: hidden;

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
            justify-content: center;
            align-items: center;
            padding: 10px;
            box-sizing: border-box;
            user-select: none;
        }

        img {
            user-select: none;
            cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
        }

        .content-border {
            pointer-events: none;
            position: fixed;
            z-index: 999;
            top: -99999px;
            left: -99999px;
        }
    }
}
</style>
