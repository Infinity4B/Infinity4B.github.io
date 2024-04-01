<script setup lang="ts">
const props = defineProps({
    api: {
        type: String,
        required: true,
    },
})
const {api} = props

const expand = ref(false)

const pdata = ref()
const ppending = ref(true)

const showPic = async () => {
    expand.value = true
    const { data, pending } = await useFetch(api, { method: 'GET'})
    pdata.value = data.value
    ppending.value = pending.value
}

</script>

<template>
    <div>
        <div v-if="ppending">

        </div>
        <div v-else>
            <NuxtImg fit="cover" :src="pdata[0]" width="500" height="500" />
        </div>
        <br>
        <el-button plain @click="showPic" style="width: 60px">看看</el-button>
    </div>
</template>