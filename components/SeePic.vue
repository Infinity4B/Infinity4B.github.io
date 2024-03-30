<script setup lang="ts">
const props = defineProps({
    api: {
        type: String,
        required: true,
    },
})
const {api} = props
const {data, error, execute, refresh, pending } = await useFetch(api)
</script>

<template>
    <div>
        <NuxtImg :src="data[0]"/>
        <br>
        <el-button plain @click="refresh">换一张</el-button>
    </div>
</template>