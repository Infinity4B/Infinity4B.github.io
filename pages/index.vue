<script lang="ts" setup>
import { ElMessage } from 'element-plus'

const sendMsg = (data) => {
    ElMessage({
        showClose: true,
        message: data,
        center: true,
    })
}

const apiMessage = async (api : string) => {
    const { data, pending, error, refresh } = await useFetch(api, { method: 'GET'})
    if (data.value.from_who){
        sendMsg('“'+data.value.hitokoto + "”——《" + data.value.from + '》' + data.value.from_who)
    }
    else{
        sendMsg('“'+data.value.hitokoto + "”——《" + data.value.from + '》')
    }
}

const activePicName = ref('cat_tab')
const activeListenName = ref('en_songs_tab')

const handleListenClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
}

const handlePicClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
}

</script>
<template>
    <el-container>
        <el-container>
            <el-aside width="15%">
                <div style="text-align:center">
                    <br>
                    <br>
                    <div><el-text size="large" tag="b">手气不错</el-text></div>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=k')">哲学</el-button>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=c')">游戏</el-button>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=d')">文学</el-button>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=h')">影视</el-button>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=i')">诗词</el-button>
                    <br>
                    <br>
                    <el-button plain @click="apiMessage('https://v1.hitokoto.cn/?c=j')">网易云</el-button>
                </div>
            </el-aside>
            <el-main>
                <el-card style="max-width: 550px">
                    <template #header>历史上的今天</template>
                    <HistoryToday />
                </el-card>

                <br>

                <el-card style="max-width: 550px">
                    <template #header>喝点什么</template>
                    <What2Drink />
                </el-card>

                <br>

                <el-card style="max-width: 550px">
                    <el-tabs v-model="activePicName" class="listen" @tab-click="handlePicClick">
                        <template #header>看看动物</template>
                        <el-tab-pane label="看看猫" name="cat_tab">
                            <SeePic api="http://shibe.online/api/cats"></SeePic>
                        </el-tab-pane>
                        <el-tab-pane label="看看狗" name="dog_tab">
                            <SeePic api="http://shibe.online/api/shibes"></SeePic>
                        </el-tab-pane>
                        <el-tab-pane label="看看鸟" name="bird_tab">
                            <SeePic api="http://shibe.online/api/birds"></SeePic>
                        </el-tab-pane>
                    </el-tabs>
                </el-card>

                <br>

                <el-card style="max-width: 550px">
                    <template #header>随便听听</template>
                    <el-tabs v-model="activeListenName" class="listen" @tab-click="handleListenClick">
                        <el-tab-pane label="英文" name="en_songs_tab">
                            <ListenMusic api="https://api.injahow.cn/meting/?type=playlist&id=73591222" />
                        </el-tab-pane>
                        <el-tab-pane label="中文" name="cn_songs_tab">
                            <ListenMusic api="https://api.injahow.cn/meting/?type=playlist&id=950016701" />
                        </el-tab-pane>
                        <el-tab-pane label="日文" name="jp_songs_tab">
                            <ListenMusic api="https://api.injahow.cn/meting/?type=playlist&id=3114055720" />
                        </el-tab-pane>
                        <el-tab-pane label="纯音乐" name="pure_songs_tab">
                            <ListenMusic api="https://api.injahow.cn/meting/?type=playlist&id=950022539" />
                        </el-tab-pane>
                        <el-tab-pane label="最喜欢" name="mix_songs_tab">
                            <ListenMusic api="https://api.injahow.cn/meting/?type=playlist&id=9282724009" />
                        </el-tab-pane>
                    </el-tabs>
                </el-card>
            </el-main>
        </el-container>
    </el-container>
</template>