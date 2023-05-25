<template>
    <el-menu class="api-menu">
        <el-sub-menu index="1">
            <template #title>
                <el-icon>
                    <location />
                </el-icon>
                <span>按键命令</span>
            </template>
            <el-menu-item index="1-1">
                <div class="left-container">
                    <span class="title">按键事件</span>
                    <div class="parallel">
                        <span>按键：</span>
                        <el-select v-model="state.keyevent.value" placeholder="Select" filterable>
                            <el-option v-for="item in keyevent" :key="item.key" :label="item.label" :value="item.key">
                                <div style="display: flex;justify-content: space-between;gap: 20px;">
                                    <span>{{ item.label }}</span>
                                    <span style=" color: var(--el-text-color-secondary);">{{ item.key }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <el-button @click="insert('keyevent')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="1-2">
                <div class="left-container">
                    <span class="title">屏幕点击</span>
                    <div class="parallel">
                        <span>x：</span>
                        <el-input v-model.number="state.tap.x" />
                        <span>y：</span>
                        <el-input v-model.number="state.tap.y" />
                    </div>
                </div>
                <el-button @click="insert('tap')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="1-3">
                <div class="left-container">
                    <span class="title">屏幕长按</span>
                    <div class="parallel">
                        <span>x：</span>
                        <el-input v-model.number="state.longpress.x" />
                        <span>y：</span>
                        <el-input v-model.number="state.longpress.y" />
                    </div>
                    <div class="parallel">
                        <span>时间：</span>
                        <el-input v-model.number="state.longpress.time" />
                        <span>ms</span>
                    </div>
                </div>
                <el-button @click="insert('longpress')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="1-4">
                <div class="left-container">
                    <span class="title">屏幕拖动</span>
                    <div class="parallel">
                        <span>x：</span>
                        <el-input v-model.number="state.swipe.x" />
                        <span>y：</span>
                        <el-input v-model.number="state.swipe.y" />
                    </div>
                    <div class="parallel">
                        <span>x：</span>
                        <el-input v-model.number="state.swipe.toX" />
                        <span>y：</span>
                        <el-input v-model.number="state.swipe.toY" />
                    </div>
                    <div class="parallel">
                        <span>时间：</span>
                        <el-input v-model.number="state.swipe.time" />
                        <span>ms</span>
                    </div>
                </div>
                <div class="parallel">
                    <el-button @click="insert('swipe')">插入</el-button>
                </div>
            </el-menu-item>
            <el-menu-item index="1-5">
                <div class="left-container">
                    <span class="title">屏幕输入</span>
                    <div class="parallel">
                        <span>内容：</span>
                        <el-input v-model="state.input.value" placeholder="测试文字" />
                    </div>
                </div>
                <el-button @click="insert('input')">插入</el-button>
            </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
            <template #title>
                <el-icon>
                    <location />
                </el-icon>
                <span>其他命令</span>
            </template>
            <el-menu-item index="2-1">
                <div class="left-container">
                    <span class="title">等待</span>
                    <div class="parallel">
                        <span>时间：</span>
                        <el-input v-model.number="state.delay.value" />
                        <span>ms</span>
                    </div>
                </div>
                <el-button @click="insert('delay')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="2-2">
                <div class="left-container">
                    <span class="title">无限循环</span>
                </div>
                <el-button @click="insert('loop')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="2-3">
                <div class="left-container">
                    <span class="title">限次循环</span>
                    <div class="parallel">
                        <span>循环：</span>
                        <el-input-number v-model="state.loopByNum.value" :min="1" />
                        <span>次</span>
                    </div>
                </div>
                <el-button @click="insert('loopByNum')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="2-4">
                <div class="left-container">
                    <span class="title">限时循环</span>
                    <div class="parallel">
                        <span>时间：</span>
                        <el-input v-model="state.loopByTime.value" />
                        <span>ms</span>
                    </div>
                </div>
                <el-button @click="insert('loopByTime')">插入</el-button>
            </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
            <template #title>
                <el-icon>
                    <location />
                </el-icon>
                <span>高级命令</span>
            </template>
            <el-menu-item index="3-1">
                <div class="left-container">
                    <span class="title">单击</span>
                    <div class="parallel">
                        <span>资源ID</span>
                        <el-input v-model="state.clickId.value" />
                    </div>
                </div>
                <el-button @click="insert('clickId')">插入</el-button>
            </el-menu-item>
            <el-menu-item index="3-2">
                <div class="left-container">
                    <span class="title">单击</span>
                    <div class="parallel">
                        <span>文本</span>
                        <el-input v-model="state.clickText.value" />
                    </div>
                </div>
                <el-button @click="insert('clickText')">插入</el-button>
            </el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<script setup>
import { keyevent } from './config'
const { insertText } = inject('work')
const props = defineProps({
    activeName: {
        type: String,
        required: true
    }
})
const state = reactive({
    keyevent: { value: 'KEYCODE_HOME', code: (value) => `await adb.keyevent(${value})` },
    tap: { x: '', y: '', code: (x, y) => `await adb.tap(${x},${y})` },
    longpress: { x: '', y: '', time: 1000, code: (x, y, time) => `await adb.longpress(${x},${y},${time})` },
    swipe: { x: '', y: '', toX: '', toY: '', time: 1000, code: (x, y, toX, toY, time) => `await adb.swipe(${x},${y},${toX},${toY},${time})` },
    input: { value: '', code: (value) => `await adb.input(${value})` },
    delay: { value: 1000, code: (value) => `await delay(${value})` },
    loop: { code: () => `while(true){\n\n}` },
    loopByNum: { value: 1, code: (value) => `for(let i = 0; i < ${value}; i++){\n\n}` },
    loopByTime: { value: 8000, code: (value) => `await loopByTime(async()=>{\n\n},${value})` },
    clickId: { value: '', code: (value) => `await clickId(${value})` },
    clickText: { value: '', code: (value) => `await clickText(${value})` }
})
onMounted(() => {

})

function insert (type = '') {
    if (props.activeName === 'codemirror') {
        const config = state[type]
        if (config) {
            const { code } = config
            const args = Object.entries(config).filter(v => ['code'].indexOf(v[0]) === -1).map(v => JSON.stringify(v[1]))
            insertText(`${code(...args)}`, 'after')
        }
    }
    if (props.activeName === 'visualization') {
        state[type]
    }
}
</script>

<style lang='scss' scoped>
.api-menu {
    .el-menu-item:first-child {
        border-top: 1px solid var(--el-border-color-hover);
    }

    .el-menu-item {
        height: auto;
        gap: 10px;
        border-bottom: 1px solid var(--el-border-color-hover);
        min-height: var(--el-menu-sub-item-height);
        user-select: none;

        .parallel {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .left-container {
            min-width: 70%;
            max-width: 70%;
            display: flex;
            flex-direction: column;
            // gap: 5px;
            padding: 5px;
            padding-left: 0;

            .title {
                font-size: 17px;
                line-height: 24px;
                height: 24px;
                margin: 0;
                padding: 0;
            }

            .parallel span {
                color: var(--el-menu-text-color);
            }
        }
    }
}
</style>
