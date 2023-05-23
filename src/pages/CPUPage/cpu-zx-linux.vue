<template>
    <div class="echarts-box">
        <div id="cpu-zx-a72" :style="{ width: '100%', height: '100%' }"></div>
    </div>
</template>

<script setup>
import * as echarts from 'echarts'
const echart = echarts
let chart

const state = reactive({
    series: [],
    xAxisData: []
})

onMounted(() => {
    chart = echart.init(document.getElementById('cpu-zx-a72'), 'dark')
    initChart()
})

onUnmounted(() => {
    echart.dispose
})

const objectSplit = (data, keys) => {
    if (data?.constructor !== Object || keys?.constructor !== Array) {
        console.error('类型错误...')
        return
    }
    const newDate = { ...data }
    /** 分割属性为空 */
    if (!keys.length) {
        return [newDate, {}]
    }
    const splitIsObj = {}
    for (const key of keys) {
        splitIsObj[key] = newDate[key]
        delete newDate[key]
    }
    return [newDate, splitIsObj]
}

appApi.ipcRenderer.on('call-cpu-linux-event', (event, data) => {
    const [, obj] = objectSplit(data.top, ['cpu', 'user', 'nice', 'sys', 'idle', 'iow', 'irq', 'sirq', 'host'])
    const arr = Object.entries(obj).map(v => { return [v[0], parseFloat(v[1])] })
    for (const [key, value] of arr) {
        const index = state.series.findIndex(v => v.name === key)
        if (index !== -1) {
            const seriesDataLength = state.series[index]?.data?.length || 0
            const length = state.xAxisData?.length || 0
            if (length - seriesDataLength > 0) state.series[index].data.push(...new Array(length - seriesDataLength).fill(0))
            state.series[index].data.push(value)
        } else {
            state.series.push({
                name: key,
                data: [...new Array(state.xAxisData.length).fill(0), value],
                type: 'line',
                emphasis: { focus: 'series' }
            })
        }
    }
    state.xAxisData.push(new Date().toLocaleTimeString())
    for (const item of state.series) {
        item.markPoint = {
            data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
            ]
        }
        if (item.data.length < state.xAxisData.length) item.data.push(0)
    }
    chart.setOption({ series: state.series, xAxis: { data: state.xAxisData } })
})

// 基础配置一下Echarts
function initChart (options = {}) {
    chart.setOption({
        color: ['#FF4500', '#32CD32', '#FF00FF', '#1E90FF', '#00FFFF', '#FF69B4', '#800080', '#00FF7F', '#FFD700', '#9400D3', '#FF8C00', '#8B0000', '#40E0D0', '#FF1493', '#FFC0CB'],
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none',
                    title: {
                        zoom: '缩放',
                        back: '还原'
                    }
                },
                saveAsImage: { title: '保存图片' }
            }

        },
        legend: {
            top: 15,
            right: 130
        },
        grid: {
            top: 65,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: options.xAxis
        },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: '{value}%' }
            // max:400
        },
        series: options.series || [
            {
                name: '测试数据1',
                data: [33, 88],
                type: 'line',
                emphasis: { focus: 'series' }
            },
            {
                name: '测试数据2',
                data: [55, 66],
                type: 'line',
                emphasis: { focus: 'series' }
            }
        ]
    })
}

function chartResize () {
    chart.resize()
}

defineExpose({ chartResize, data: state.series })
</script>

<style lang='scss' scoped></style>
