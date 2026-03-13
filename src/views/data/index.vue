<template>
  <div class="data">
    <TableSearch
      title="数据分析"
      :searchItems="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import TableSearch from '@/components/TableSearch/index.vue'

const searchItems = [
  {
    key: 'keyword',
    label: '关键词',
    type: 'input' as const,
    placeholder: '请输入关键词',
    width: '200px'
  },
  {
    key: 'dateRange',
    label: '日期范围',
    type: 'date' as const,
    dateType: 'daterange' as const,
    placeholder: '选择日期范围',
    width: '260px'
  }
]

const handleSearch = (data: Record<string, any>) => {
  console.log('搜索数据:', data)
}

const handleReset = () => {
  console.log('重置搜索')
}
</script>

<style scoped>
.data {
  height: 100%;
}
</style>
