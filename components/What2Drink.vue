<script setup lang="ts">

const drinkList = ref([])
const initials = ['1点点', '奈雪的茶', 'CoCo', '霸王茶姬', '茶百道', '古茗', '茶理宜世', '蜜雪冰城', '茶颜悦色']
const options = Array.from({ length: initials.length }).map((_, idx) => ({
    value: `${initials[idx % 10]}`,
    label: `${initials[idx % 10]}`,
}))

const sendMsg = (data) => {
    ElMessage({
        showClose: true,
        message: data,
        center: true,
    })
}

const getWhat2Drink = () => {
    if (drinkList.value.length === 0) {
        sendMsg('列表为空！')
    }
    else {
        const id = Math.floor(Math.floor(Math.random() * drinkList.value.length * 100) / 100)
        sendMsg(drinkList.value[id])
    }
}
</script>

<template>
    <client-only>
        <el-select-v2 v-model="drinkList" :options="options" placeholder="请选择，没有的可以自己输入"
            style="width: 100%; margin-right: 16px; vertical-align: middle" allow-create filterable multiple clearable
            :reserve-keyword="false" />
    </client-only>
    <el-button plain @click="getWhat2Drink()">喝什么</el-button>
</template>