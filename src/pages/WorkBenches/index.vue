<template>
    <div class="work">
        <el-container class="work-container">
            <el-header>
                <el-button @click="getSelectRow">获取选中行</el-button>
            </el-header>
            <el-container>
                <el-aside>
                    <div class="menu-header">
                        脚本列表
                    </div>
                    <el-scrollbar>
                        <el-menu>
                            <MenuItem :menuData="state.menuData" />
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-main ref="mainRef">
                    <div class="tool">

                    </div>
                    <div class="code-edit">
                        <el-tabs v-model="activeName" type="border-card">
                            <el-tab-pane name="first">
                                <template #label>
                                    <IconLayout>
                                        <template #icon>
                                            <View />
                                        </template>
                                        <span>可视化</span>
                                    </IconLayout>
                                </template>
                            </el-tab-pane>
                            <el-tab-pane name="second">
                                <template #label>
                                    <IconLayout>
                                        <template #icon>
                                            <Edit />
                                        </template>
                                        <span>代码</span>
                                    </IconLayout>
                                </template>
                                <Codemirror ref="codemirrorRef" v-model="code" :tab-size="4" placeholder="请输入..."
                                    :extensions="extensions" @ready="onCodemirrorload" @focus="onCodeEditChange" autofocus
                                    indentWithTab />
                            </el-tab-pane>
                        </el-tabs>
                        <div class="help">
                            <div v-show="state.moveLine.y" class="move-line"
                                :style="{ top: `max(${state.moveLine.max} ,${state.moveLine.y}px)` }" />
                            <MoveGuide class="move-guide-line" @afterMove="onHelpRefreshSize" @move="onLinkMove" />
                        </div>
                    </div>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { Codemirror } from 'vue-codemirror'
// import { Text } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { suffixData, prefixData, variableData } from './codeHintConfig'
const extensions = [javascript(), autocompletion({ override: [getOptions] }), oneDark]
const mainRef = ref(null)
const codemirrorRef = ref(null)
const codemirrorView = shallowRef()
const activeName = ref('first')
const code = ref('')
const state = reactive({
    menuData: [
        {

        }
    ],
    moveLine: {
        y: undefined,
        max: 'calc(var(--header-height) + 45px)'
    }
})

onMounted(() => {
    codemirrorRef.value.$el.addEventListener('keydown', ctrlAndS)
})

onBeforeUnmount(() => {
    codemirrorRef.value.$el.removeEventListener('keydown', ctrlAndS)
})

function getSelectRow () {
    // const state = codemirrorView.value.state
    // const ranges = state.selection.ranges
    // console.log(state.doc.line(1))
    // codemirrorView.value.dispatch({
    //     changes: {
    //         from: state.doc.line(2).to,
    //         insert: new Text(['第一行', '第二行', '第三行'].join('\n') + '\n')
    //     }
    // })
    // const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
    // const cursor = ranges[0].anchor
    // const length = state.doc.length
    // const lines = state.doc.lines
    // console.log({ selected, cursor, length, lines })
}

function ctrlAndS (e) {
    if (e.ctrlKey && e.key === 's') {
        console.log('保存')
    }
}

function onCodeEditChange (e) {
    // console.log(e)
}

function onHelpRefreshSize ({ begin, end }) {
    const mainDOM = mainRef.value.$el
    const helpStyleIsHeight = getComputedStyle(mainDOM).getPropertyValue('--help-height')
    /** end.y 最小值为 var(--header-height)【40】 加 var(--el-tabs-header-height)【40】 加 5px自定义边距 = 85 */
    const helpHeight = Math.max(5, (parseInt(helpStyleIsHeight) + begin.y - Math.max(85, end.y)) || 0)
    mainDOM.style.setProperty('--help-height', `${helpHeight}px`)
    state.moveLine.y = undefined
}

function onLinkMove ({ y }) {
    state.moveLine.y = y
}

function onCodemirrorload (payload) {
    console.log(payload)
    codemirrorView.value = payload.view
}

function getOptions (context) {
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

    --el-aside-width: 266px;

    --menu-container-height: calc(var(--main-height) - var(--el-menu-item-height));

    .work-container {
        height: 100vh;

        .el-header {
            height: var(--header-height);
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
            display: flex;

            --code-edit-width: calc(100vw - var(--el-aside-width) - var(--tool-width));

            .tool {
                width: var(--tool-width);
                min-width: var(--tool-width);
                border-top: 1px solid var(--el-border-color);
                box-sizing: border-box;
            }

            .code-edit {
                :deep(.el-tabs) {
                    --tabs-height: calc(var(--main-height) - var(--help-height));
                    box-sizing: border-box;
                    width: var(--code-edit-width);
                    height: var(--tabs-height);

                    .el-tabs__content {
                        --tabs-content-padding: 1px;
                        padding: var(--tabs-content-padding);

                        .cm-editor {
                            outline: none;
                            height: calc(var(--tabs-height) - var(--el-tabs-header-height) - 2 * var(--tabs-content-padding));
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
