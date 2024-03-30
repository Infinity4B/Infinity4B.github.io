<template>
    <client-only>
        <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
            <el-menu-item index="0">
                <el-text class="mx-1" size="large"><el-link :underline="false" href="/">4B</el-link></el-text>
            </el-menu-item>
            <div class="flex-grow" />
            <el-menu-item>
                <el-switch v-model="colorMode" inline-prompt active-text="暗" inactive-text="亮" size="large"></el-switch>

            </el-menu-item>
            <el-menu-item index="1">
                <el-link :underline="false" href="/link">实用链接</el-link>
            </el-menu-item>
            <el-sub-menu index="2">
                <template #title>项目</template>
                <el-menu-item index="2-1"><el-link :underline="false"
                        href="https://character100.github.io/">Character100</el-link></el-menu-item>
                <el-menu-item index="2-2"><el-link :underline="false"
                        href="https://github.com/Infinity4B/HumanEvaluation">HumanEvaluation</el-link></el-menu-item>
            </el-sub-menu>
        </el-menu>
    </client-only>
</template>

<script lang="ts" setup>

const color = useColorMode();
const colorMode = computed({
    get: () => color.value === 'dark',
    set: () => (color.preference = (color.value === 'dark' ? 'light' : 'dark')),
});
</script>

<style>
.flex-grow {
    flex-grow: 1;
}
</style>
