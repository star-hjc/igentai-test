<template>
    <div class="node--container">
        <div class="node-view">
            <el-scrollbar ref="treeScrollbarRef" class="ui-tree" always>
                <el-tree ref="treeRef" :data="state.nodeData" :props="{
                    children: 'node',
                    label: 'label',
                }" defaultExpandAll @nodeClick="nodeClick" />
            </el-scrollbar>
            <div class="node-content">
                <el-input class="select-value" v-model="selectValue" placeholder="选择器..." clearable />
                <div class="select-button">
                    <el-button @click="onRefresh">刷新</el-button>
                    <el-button @click="onSearch">查询</el-button>
                    <el-button @click="onRefresh">插入</el-button>
                </div>
                <div class="title">
                    <span>结果：</span>
                    <span v-if="state.selectNodes?.length">{{ state.selectNodes.length }}个</span>
                </div>
                <el-scrollbar class="node-prop">
                    <template v-if="state.selectNodes?.length">
                        <div class="font" v-for="item, index in state.selectNodes.node" :key="index"
                            @click="onClickResult(item)">
                            {{ item[state.selectNodes.content] }}
                        </div>
                    </template>
                </el-scrollbar>
                <div v-if="state.node.length" class="title">属性：</div>
                <el-scrollbar v-if="state.node.length" class="node-prop">
                    <div class="font" v-for="item in state.node" :key="item[0]" @click="onPropClick(item)">{{ item[0] }}：{{
                        item[1] }}</div>
                </el-scrollbar>

            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const treeRef = ref(null)
const treeScrollbarRef = ref(null)
const selectValue = ref('')
const xmlStr = ref('')
const state = reactive({
    device: {
        baudRate: undefined,
        filePath: '',
        methodName: '',
        method: '',
        id: '',
        path: ''
    },
    json: null,
    node: {},
    item: [],
    nodeData: [],
    selectNodes: {}
})

onMounted(() => {
    state.device = { ...(useRoute().query) }
    onRefresh()
})

appApi.ipcRenderer.on('call-onRefreshScreenshot-event', (event, data) => {
    onRefresh()
})

function getProp (node) {
    if (!node) return {}
    if (node.length) node = node[0]
    return Object.values(node.attributes)?.reduce((a, b) => {
        a[b.name] = b.value
        return a
    }, {})
}

function getProps (nodes) {
    if (!nodes || !nodes?.length) return []
    return [...nodes].map((v) => {
        return getProp(v)
    })
}

async function onRefresh () {
    const [json, xml] = await adb.getUI({ ...state.device }, true)
    xmlStr.value = xml
    state.nodeData = [terrNode(json?.hierarchy || '')]
    treeScrollbarRef.value.scrollTo(0, 0)
    
}

async function onSearch () {
    if (!state.item?.[1]) return
    const node = getProps(new DOMParser().parseFromString(xmlStr.value, 'text/xml').querySelectorAll(`*[${state.item[0]}='${state.item[1]}']`))
    state.selectNodes = {
        length: node.length,
        node,
        content: state.item[0]
    }
}

function nodeClick (dataNode) {
    onClickResult(dataNode['$'])
}

function onClickResult (item) {
    state.node = Object.entries(item)
    if (item.bounds) appApi.onNodeClick(JSON.parse(item.bounds.replace('][', ',')))
}

function onPropClick (item) {
    if (!item[1]) return
    state.item = item
    selectValue.value = `*[${item[0]}='${item[1]}']`
}

function terrNode (node) {
    if (!node) return []
    const newNode = node
    const classNameArray = newNode?.['$']?.class?.split('.') || ['节点']
    const className = classNameArray.at(-1)
    const text = newNode?.['$']?.text
    newNode.label = `${className}${text ? '---->' + text : ''}`
    if (!newNode.node) {
        newNode.node = []
        return newNode
    }
    for (let i = 0; i < newNode.node.length; i++) {
        if (!newNode.node[i]) {
            newNode.node[i] = { label: '未知节点' }
            continue
        }
        newNode.node[i] = terrNode(newNode.node[i])
    }
    return newNode
}

</script>

<style lang='scss' scoped>
.node--container {
    .node-view {
        height: 100vh;
        display: flex;

        .node-content {
            padding: 10px;
            min-width: 40%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 10px;

            .title {
                font-size: 14px;
                color: #666;
            }

            .select-value {
                // width: 270px;
                // min-width: 270px;

                :deep(.el-input-group__prepend) {
                    color: #ffffff;
                    background-color: #409eff;
                }
            }

            .select-button {
                display: flex;
                justify-content: space-around;
            }

            .select-result {
                height: 200px;
            }

            .node-prop {
                height: 200px;
                border: 1px solid #e8e8e8;

                :deep(.el-scrollbar__view) {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    box-sizing: border-box;
                }

                .font {
                    font-size: 12px;
                    color: #666666;
                }

                .font:hover {
                    color: #409eff;
                    background: #f5f7fa;
                    cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
                }
            }
        }

        .ui-tree {
            padding: 0 10px 10px 0;
            box-sizing: border-box;
            overflow: auto;
            min-width: 60%;
            border-top: 1px solid #e8e8e8;
            border-right: 1px solid #e8e8e8;

            :deep(.el-tree) {
                display: inline-block;
                width: 100%;

                .el-tree-node>.el-tree-node__children {
                    overflow: visible;
                }
            }
        }
    }
}
</style>
