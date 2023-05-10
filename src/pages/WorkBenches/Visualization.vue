<template>
    <div class="visualization-container">
        <el-timeline>
            <el-timeline-item v-for="activity in state.activities" :key="activity.index" :timestamp="`步骤${activity.index}`"
                type="primary" :hollow="true" size="large" placement="top">
                <div class="button">
                    <el-tag v-for="tag, index in activity.tags" :key="`${activity.index}-${index}`" :type="tag.type">{{
                        tag.content + index }}</el-tag>
                </div>
                <div class="tool">
                    <!-- <el-button type="primary" icon="edit" circle></el-button> -->
                    <!-- <el-button type="primary" icon="copy-document" circle></el-button> -->
                    <!-- <el-button icon="rank" circle></el-button> -->
                    <el-button type="danger" icon="delete" circle></el-button>
                </div>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>

<script setup>
onMounted(() => {

})

const state = reactive({
    activities: [
        {
            index: 1,
            code: '',
            tags: [
                { content: '等待' }
            ]

        }, {
            index: 2,
            code: '',
            tags: [
                { content: '等待' }
            ]
        }, {
            index: 3,
            code: '',
            tags: [
                { content: '等待' }
            ]
        }, {
            index: 4,
            code: '',
            tags: [
                { content: '等待' }
            ]
        }
    ]
})
</script>

<style lang='scss' scoped>
.visualization-container {
    padding: 20px;
    height: 100%;

    :deep(.el-timeline) {
        .el-timeline-item__content {
            display: flex;
            white-space: nowrap;
            justify-content: space-between;

            .button {
                display: flex;
                gap: 10px;
            }
        }
    }
}
</style>
