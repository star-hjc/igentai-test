<template>
  <RouterView></RouterView>
</template>

<script setup>
import { useViewStore } from '@/store'
const viewStore = useViewStore()

onMounted(async () => {
    viewStore.setData({
        assetsPath: await appApi.getAssetsPath()
    })
})

</script>

<style lang='scss' scoped></style>
