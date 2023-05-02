<template>
    <div class="right-click-menu-item">
        <span v-if="label">{{ label }}</span>
        <slot v-else />
    </div>
</template>

<script setup>
defineProps({
    label: String
})
</script>

<style lang='scss' scoped>
.right-click-menu-item {
    min-width: 88px;
    padding: 8px 10px;
    border: radius 8px;
    font-size: 12px;

    &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
    }
}
</style>
