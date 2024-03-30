<script setup>
const config = useRuntimeConfig()
import { ref } from 'vue'
const loading = ref(true)
const { data } = await useFetch('https://api.notion.com/v1/databases/ee0381b0e0db4e54832bf59b2999a8b3/query',
  {
    method: 'POST',
    headers: {
      "Authorization": config.apiSecret,
      "Notion-Version": "2022-06-28"
    }
  })
const tableData = []
for (var i = 0; i < data.value.results.length;i++){
  var row_dict = { name: data.value.results[i].properties.Name.title[0].plain_text, link: data.value.results[i].properties.URL.url }
  tableData.push(row_dict)
}
loading.value = false
</script>

<template>
  <el-table v-loading="loading" :data="tableData" stripe style="width: 100%" max-height="750px">
    <el-table-column prop="name" label="网页名称" />
    <el-table-column prop="link" label="网页链接">
      <template #default="scope">
        <el-link :href=scope.row.link> {{ scope.row.link }}</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>