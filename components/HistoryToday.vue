<script setup lang="ts">
const expand = ref(false)

const hdata = ref()
const hpending = ref(true)

const showHistory = async () => {
    expand.value = true
    const { data, pending } = await useFetch('/history', { method: 'GET', server: true })
    hdata.value = data.value
    hpending.value = pending.value
}
</script>

<template>
    <div v-if="expand">
        <div v-if="hpending">
            <el-button plain :loading="hpending" style="width: 100px">加载中</el-button>
        </div>
        <div v-else>
            <el-carousel type="card" height="200px" :interval="2000" motion-blur="true">
                <el-carousel-item v-for="res in hdata.result" :key="res">
                    <el-card style="max-width: 480px">
                        <template #header>
                            <div class="card-header">
                                <span>{{ res.date }}</span>
                            </div>
                        </template>
                        {{ res.title }}
                    </el-card>
                </el-carousel-item>
            </el-carousel>
        </div>
    </div>
    <div v-else>
        <el-button plain @click="showHistory" style="width: 100px">看看是啥</el-button>
    </div>
</template>