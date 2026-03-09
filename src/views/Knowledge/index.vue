<template>
  <div class="knowledge">
    <TableSearch
      title="知识文章"
      :searchItems="searchItems"
      :showAddBtn="true"
      addBtnText="新增"
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
    key: 'title',
    label: '文章标题',
    type: 'input',
    placeholder: '请输入文章标题',
    width: '200px'
  },
  {
    key: 'category',
    label: '分类',
    type: 'select',
    placeholder: '请选择分类',
    width: '200px',
    options: [
      { label: '心理健康', value: 'mental' },
      { label: '情绪管理', value: 'emotion' },
      { label: '人际关系', value: 'relationship' },
      { label: '职业发展', value: 'career' }
    ]
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '200px',
    options: [
      { label: '已发布', value: 'published' },
      { label: '草稿', value: 'draft' },
      { label: '已下架', value: 'offline' }
    ]
  }
]

const handleSearch = (data: Record<string, any>) => {
  console.log('搜索数据:', data)
}

const handleReset = () => {
  console.log('重置搜索')
}

const handleAdd = () => {
  console.log('新增文章')
}
</script>

<style scoped>
.knowledge {
  height: 100%;
}
</style>
