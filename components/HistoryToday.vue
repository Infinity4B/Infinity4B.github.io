<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/history', { method: 'GET', server: true })
console.log(data)
</script>

<template>
    <el-carousel type="card" height="200px" :interval="2000" motion-blur="true" v-loading="pending">
        <el-carousel-item v-for="res in data.result" :key="res">
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
</template>