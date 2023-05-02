<template>
    <template v-for="item in menuData" :key="item[defaultKeys.index]">
        <el-sub-menu v-if="item[defaultKeys.children]" :index="item[defaultKeys.index]"
            @contextmenu.prevent.stop="onRightClick($event, item)">
            <template #title>
                <el-icon v-if="item[defaultKeys.icon]">
                    <component :is="item[defaultKeys.icon]" />
                </el-icon>
                <span>{{ item[defaultKeys.title] }}</span>
                <el-tag class="tag" :type="item[defaultKeys.children].length ? 'success' : 'warning'" round>
                    {{ item[defaultKeys.children].length }}
                </el-tag>
            </template>
            <MenuItem :menuData="item[defaultKeys.children]" :defaultProps="defaultProps" @clickFile="onClickFile"
                @rightClick="onRightClick" />
        </el-sub-menu>
        <el-menu-item v-else :index="item[defaultKeys.index]" @contextmenu.prevent.stop="onRightClick($event, item)"
            @click="onClickFile($event, item)">
            <el-icon v-if="item[defaultKeys.icon]">
                <component :is="item[defaultKeys.icon]" />
            </el-icon>
            <span>{{ item[defaultKeys.title] }}</span>
        </el-menu-item>
    </template>
</template>

<script setup>
import MenuItem from './index.vue'

const prop = defineProps({
    menuData: Array,
    defaultProps: {
        type: Object,
        default () {
            return {
                index: 'index',
                title: 'title',
                icon: 'icon',
                children: 'children'
            }
        }
    }
})

const defaultKeys = ref({
    index: 'index',
    title: 'title',
    icon: 'icon',
    children: 'children',
    ...prop.defaultProps
})

const emits = defineEmits(['clickFile', 'rightClick'])

function onClickFile (e, item) {
    emits('clickFile', e, item)
}

function onRightClick (e, item) {
    emits('rightClick', e, item)
}
</script>

<style lang='scss' scoped>
.tag {
    margin-left: 80px;
}
</style>
