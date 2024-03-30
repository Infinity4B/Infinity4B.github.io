<template>
    <AppHeader></AppHeader>
    <el-row justify="space-around" align="middle">
        <el-col :span="12">
            <slot />
        </el-col>
    </el-row>
</template>