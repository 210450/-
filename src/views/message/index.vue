<template>
  <div class="message">
    <TableSearch
      title="咨询记录"
      :searchItems="searchItems"
      :showAddBtn="true"
      addBtnText="新增记录"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
    />
  </div>
</template>

<script setup lang="ts">
import TableSearch from '@/components/TableSearch/index.vue'

const searchItems = [
  {
    key: 'userName',
    label: '用户名',
    type: 'input' as const,
    placeholder: '请输入用户名',
    width: '200px',
  },
  {
    key: 'type',
    label: '咨询类型',
    type: 'select' as const,
    placeholder: '请选择类型',
    width: '200px',
    options: [
      { label: '心理咨询', value: 'psychological' },
      { label: '情绪疏导', value: 'emotional' },
      { label: '危机干预', value: 'crisis' },
    ],
  },
  {
    key: 'date',
    label: '咨询日期',
    type: 'date' as const,
    placeholder: '选择日期',
    width: '200px',
  },
]

const handleSearch = (data: Record<string, any>) => {
  console.log('搜索数据:', data)
}

const handleReset = () => {
  console.log('重置搜索')
}

const handleAdd = () => {
  console.log('新增咨询记录')
}
</script>

<style scoped>
.message {
  height: 100%;
}
</style>
