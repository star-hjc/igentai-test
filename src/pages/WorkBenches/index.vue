<template>
    <div class="work" ref="workRef">
        <el-container class="work-container">
            <el-header>
                <el-tag :type="runStateEnum[runState][1]" style="margin-right: 15px;">{{ runStateEnum[runState][0]
                }}</el-tag>
                <el-popover placement="top-start" title="设备信息" :width="215" trigger="hover">
                    <template #reference>
                        <el-button>设备信息</el-button>
                    </template>
                    <div v-if="state.query.method">
                        <span>连接方式：</span>
                        <span style="color:#409eff">{{ state.query.methodName }}</span>
                    </div>
                    <div>设备ID：{{ state.query.id || state.query.path }}</div>
                    <div v-if="state.query.path">波特率：{{ state.query.baudRate }}</div>
                </el-popover>
                <el-button @click="getScreen">获取屏幕</el-button>
                <el-button @click="getUiNode">获取UI节点</el-button>
                <el-button @click="getSelectRow">获取选中行</el-button>
                <el-button @click="runCode" :disabled="runState === 3">运行</el-button>
                <el-button @click="insertText(new Date().toLocaleTimeString(), 'before')">插入“123”文本</el-button>
            </el-header>
            <el-container>
                <el-aside>
                    <div class="menu-header">
                        命令列表
                    </div>
                    <el-scrollbar>
                        <ApiMenu :activeName="activeName" />
                    </el-scrollbar>
                </el-aside>
                <el-main ref="mainRef">
                    <div class="tool">
                        <el-button type="success" title="上一行" :icon="Top" link />
                        <el-button type="success" title="下一行" :icon="Bottom" link />
                        <el-button type="danger" title="删除当前选中行" :icon="Close" link />
                        <el-button type="danger" title="断点" :icon="WarningFilled" link />
                        <el-divider />
                        <MoveGuide class="move-guide-line" @move="onAsideRefreshSize" />
                    </div>
                    <div class="code-edit">
                        <el-tabs v-model="activeName" type="border-card">
                            <el-tab-pane name="visualization">
                                <template #label>
                                    <IconLayout>
                                        <template #icon>
                                            <View />
                                        </template>
                                        <span>可视化</span>
                                    </IconLayout>
                                </template>
                                <Visualization />
                            </el-tab-pane>
                            <el-tab-pane name="codemirror">
                                <template #label>
                                    <IconLayout>
                                        <template #icon>
                                            <Edit />
                                        </template>
                                        <span>代码</span>
                                    </IconLayout>
                                </template>
                                <Codemirror ref="codemirrorRef" v-model="code" :tab-size="4" placeholder="请输入..."
                                    :extensions="extensions" @ready="onCodemirrorload" autofocus indentWithTab />
                            </el-tab-pane>
                        </el-tabs>
                        <div class="help">
                            <div v-show="state.moveLine.y" class="move-line"
                                :style="{ top: `max(${state.moveLine.max} ,${state.moveLine.y}px)` }" />
                            <MoveGuide class="move-guide-line" @afterMove="onHelpRefreshSize" @move="onLinkMove" />
                            <div class="help-container">
                                <div class="title">
                                    <span>帮助</span>
                                    <el-icon @click="onHelpClose">
                                        <Close />
                                    </el-icon>
                                </div>

                            </div>
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import ApiMenu from './ApiMenu.vue'
import Visualization from './Visualization.vue'
import { Codemirror } from 'vue-codemirror'
import { autocompletion } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useRoute } from 'vue-router'
import { suffixData, prefixData, variableData } from './config'
import { Close, Top, Bottom, WarningFilled } from '@element-plus/icons-vue'
const extensions = [javascript(), autocompletion({ override: [getOptions] }), oneDark]
const mainRef = ref(null)
const workRef = ref(null)
const codemirrorRef = ref(null)
const codemirrorView = shallowRef()
const runState = ref(2)
const runStateEnum = ref([['失败', 'danger'], ['成功', 'success'], ['待运行', 'info'], ['运行中', '']])
const activeName = ref('codemirror')
const code = ref('')
provide('work', { insertText })

const state = reactive({
    menuData: [
        {

        }
    ],
    query: {
        baudRate: undefined,
        filePath: '',
        methodName: '',
        method: '',
        id: '',
        path: ''
    },
    moveLine: {
        y: undefined,
        max: 'calc(var(--header-height) + 45px)'
    }
})

onMounted(() => {
    const query = useRoute().query || {}
    state.query = { ...query, baudRate: parseInt(query.baudRate || 0) }
    codemirrorRef.value.$el.addEventListener('keydown', ctrlAndS)
    getCode()
})

function getCode() {
    if (!state.query?.filePath) return
    appApi.readFile(state.query?.filePath).then((data) => {
        code.value = data
    })
}

async function saveCode() {
    ElMessageBox.confirm('是否保存该案例？', '保存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(() => {
        appApi.writeFile(state.query.filePath, code.value).then(result => {
            if (result) return ElMessage.success('保存成功...')
            ElMessage.error('保存失败...')
        })
    }).catch(() => { })
}

onBeforeUnmount(() => {
    codemirrorRef.value.$el.removeEventListener('keydown', ctrlAndS)
})

function getScreen() {
    viewApi.createGetScreenWindow({ ...state.query })
}

function getUiNode() {
    viewApi.createUiNodeWindow({ ...state.query })
}

function getSelectRow() {
    const state = codemirrorView.value.state
    const ranges = state.selection.ranges
    const line = state.doc.lineAt(state.selection.main.head).number
    const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
    const cursor = ranges[0].anchor
    const length = state.doc.length
    const lines = state.doc.lines
    console.log(state.doc.line(line))
    console.log({ selected, cursor, length, lines, line })
}

async function runCode() {
    // 运行中
    runState.value = 3
    try {
        await run(code.value, { ...state.query }).then(() => { runState.value = 1 })
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
        runState.value = 0
    }
}

function insertText(content = '', type = 'end') {
    const state = codemirrorView.value.state
    const line = state.doc.lineAt(state.selection.main.head).number
    let from = 0
    let insert = ''
    switch (type) {
        case 'before':
            from = state.doc.line(Math.max(line - 1, 1)).to + (line < 2 ? 0 : 1)
            insert = `${content}\n`
            break
        case 'after':
            from = state.doc.line(line).to
            insert = `\n${content}`
            break
        case 'begin':
            from = 0
            insert = `${content}\n`
            break
        /** end */
        default:
            from = state.doc.line(state.doc.lines).to
            insert = `\n${content}`
            break
    }
    codemirrorView.value.dispatch({
        changes: { from, insert }
    })
}

function ctrlAndS(e) {
    if (e.ctrlKey && e.key === 's') saveCode()
}

function onAsideRefreshSize({ x }) {
    const workDOM = workRef.value
    workDOM.style.setProperty('--el-aside-width', `${Math.max(300, x || 0)}px`)
}

function onHelpRefreshSize({ begin, end }) {
    const mainDOM = mainRef.value.$el
    const helpStyleIsHeight = getComputedStyle(mainDOM).getPropertyValue('--help-height')
    /** end.y 最小值为 var(--header-height)【40】 加 var(--el-tabs-header-height)【40】 加 5px自定义边距 = 85 */
    const helpHeight = Math.max(5, (parseInt(helpStyleIsHeight) + begin.y - Math.max(85, end.y)) || 0)
    mainDOM.style.setProperty('--help-height', `${helpHeight}px`)
    state.moveLine.y = undefined
}

function onLinkMove({ y }) {
    state.moveLine.y = y
}

function onHelpClose() {
    const mainDOM = mainRef.value.$el
    mainDOM.style.setProperty('--help-height', `85px`)
}

function onCodemirrorload(payload) {
    console.log(payload)
    codemirrorView.value = payload.view
}

function getOptions(context) {
    const prefix = context.matchBefore(/\w+\.\.\w*/)
    const suffix = context.matchBefore(/\w+\.\w*/)
    const variable = context.matchBefore(/\s*\w*\s*/)
    if (prefix?.text) {
        const value = prefix.text.split('..')[0]
        return {
            from: prefix.from,
            options: suffixData(value)
        }
    }
    if (suffix?.text) {
        return {
            from: suffix.from,
            options: prefixData()
        }
    }
    if (variable?.text) {
        const { text } = variable
        const matchText = text.match(/\w/)?.[0]
        return {
            from: variable.from + (matchText ? text.indexOf(matchText) : 0),
            options: variableData()
        }
    }
    return null
}

</script>

<style lang='scss' scoped>
.work {
    --header-height: 40px;

    --main-height: calc(100vh - var(--header-height));

    --el-aside-width: 300px;

    --menu-container-height: calc(var(--main-height) - var(--el-menu-item-height));

    .work-container {
        height: 100vh;

        .el-header {
            height: var(--header-height);
            display: flex;
            align-items: center;
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
            --el-main-padding: 0;
            --help-height: 200px;
            --tool-width: 40px;
            --code-edit-width: calc(100vw - var(--el-aside-width) - var(--tool-width));
            display: flex;

            .tool {
                width: var(--tool-width);
                min-width: var(--tool-width);
                border-top: 1px solid var(--el-border-color);
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;

                .move-guide-line {
                    box-sizing: border-box;
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    cursor: url('@/assets/img/cursor/left-right.cur'), e-resize;
                }

                .el-button {
                    font-size: 19px;
                    width: 100%;
                    height: var(--tool-width);
                }

                .el-button+.el-button {
                    margin-left: 0;
                }

                .el-divider--horizontal {
                    width: 66%;
                    margin: 5px auto;
                }
            }

            .code-edit {
                :deep(.el-tabs) {
                    --tabs-height: calc(var(--main-height) - var(--help-height));
                    box-sizing: border-box;
                    width: var(--code-edit-width);
                    height: var(--tabs-height);

                    .el-tabs__content {
                        --tabs-content-padding: 1px;
                        --tabs-content-height: calc(var(--tabs-height) - var(--el-tabs-header-height) - 2 * var(--tabs-content-padding));
                        height: var(--tabs-content-height);
                        padding: var(--tabs-content-padding);

                        .el-tab-pane {
                            height: var(--tabs-content-height);
                        }

                        .cm-editor {
                            outline: none;
                            height: var(--tabs-content-height);
                        }
                    }
                }

                .help {
                    height: var(--help-height);
                    position: relative;
                    border: 1px solid var(--el-border-color);
                    border-top: none;
                    border-bottom: none;
                    box-sizing: border-box;
                    padding-top: 5px;

                    .help-container {
                        user-select: none;
                        height: calc(var(--help-height) - 5px);

                        .title {
                            padding: 0 10px;
                            background: var(--el-border-color);
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            .el-icon {
                                cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
                                color: var(--el-color-danger);
                            }
                        }
                    }

                    .move-line {
                        position: fixed;
                        height: 1px;
                        border-top: 1px dashed var(--el-color-primary);
                    }

                    .move-guide-line {
                        position: absolute;
                        top: 0;
                        height: 5px;
                    }

                    .move-line,
                    .move-guide-line {
                        width: 100%;
                        user-select: none;
                        cursor: url('@/assets/img/cursor/up-down.cur'), n-resize;
                    }
                }
            }
        }
    }
}
</style>
