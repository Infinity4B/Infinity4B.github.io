<script setup lang="ts">
const props = defineProps({
    api: {
        type: String,
        required: true,
    },
})
const {api} = props

const getSongList = async (api: string) => {
    const { data, pending, error, refresh } = await useFetch(api, { method: 'GET'})
    return data
}

const song_list = await getSongList(api)

const getRandomSongId = (songList) => {
    const rawList = JSON.parse(JSON.stringify(songList.value))
    const id = Math.floor(Math.random() * rawList.length)
    return rawList[id].url.match(/\d+/g)[0]
}

const song_id = ref(getRandomSongId(song_list))
const updateSongID = () => { song_id.value = getRandomSongId(song_list) }
const getUrl = () => { return "https://music.163.com/outchain/player?type=2&id=" + song_id.value.toString() + "&auto=0&height=66" }
</script>

<template>
    <iframe class="jp" frameborder="no" border="0" marginwidth="0" marginheight="0" width=450 height=86
        :src="getUrl()"></iframe>
    <br>
    <el-button plain @click="updateSongID">换一首</el-button>
</template>