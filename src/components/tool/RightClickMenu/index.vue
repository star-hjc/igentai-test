<template>
    <div v-show="show" class="right-click-menu"
        :style="`z-index:${zIndex};left:${position[0]};top:${position[1]};`">
        <slot />
    </div>
</template>

<script setup>

defineProps({
    position: {
        type: Array,
        required: true
    },
    show: {
        type: Boolean,
        default: false
    },
    zIndex: {
        type: Number,
        default: 999
    }
})

</script>

<style lang='scss' scoped>
.right-click-menu {
    padding: 5px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 10px;
    background: #FFF;
}
</style>
