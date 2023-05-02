<template>
    <div class="move-guide" @mousedown="onMousedown" />
</template>

<script setup>

const state = reactive({
    begin: {},
    end: {}
})

const emits = defineEmits(['move', 'afterMove'])

function onMousedown ({ clientX, clientY }) {
    state.begin = { x: clientX, y: clientY }
    document.addEventListener('mouseup', onMouseup)
    document.addEventListener('mousemove', onMove)
}

function onMove ({ clientX: x, clientY: y }) {
    emits('move', { x, y })
}

function onMouseup ({ clientX, clientY }) {
    state.end = { x: clientX, y: clientY }
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onMouseup)
    emits('afterMove', { begin: state.begin, end: state.end })
}
</script>

