<template>
  <div class="icon-layout">
    <el-icon :size="size" :color="color" :class="iconClass" :style="iconStyle">
      <slot name="icon"/>
    </el-icon>
    <slot />
  </div>

</template>

<script setup>
defineProps({
    iconClass: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    },
    iconStyle: {
        type: String,
        default: ''
    }
})
</script>

<style lang="scss" scoped>
.icon-layout {
  display: flex;
  align-items: center;
  cursor: url('@/assets/img/cursor/link-select.cur'), pointer;
}
</style>
