<template>
  <div class="table-search">
    <div class="search-header">
      <h2>{{ title }}</h2>
      <el-button v-if="showAddBtn" type="primary" @click="handleAdd">{{ addBtnText }}</el-button>
    </div>
    <div class="search-form">
      <div class="search-item" v-for="item in searchItems" :key="item.key">
        <span class="search-label">{{ item.label }}</span>
        <el-input
          v-if="item.type === 'input'"
          v-model="searchData[item.key]"
          :placeholder="item.placeholder"
          :style="{ width: item.width || '200px' }"
          clearable
        />
        <el-select
          v-else-if="item.type === 'select'"
          v-model="searchData[item.key]"
          :placeholder="item.placeholder"
          :style="{ width: item.width || '200px' }"
          clearable
        >
          <el-option
            v-for="option in item.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-date-picker
          v-else-if="item.type === 'date'"
          v-model="searchData[item.key]"
          :type="item.dateType || 'date'"
          :placeholder="item.placeholder"
          :style="{ width: item.width || '200px' }"
          clearable
        />
      </div>
    </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface SelectOption {
  label: string
  value: string | number
}

interface SearchItem {
  key: string
  label: string
  type: 'input' | 'select' | 'date'
  placeholder?: string
  width?: string
  options?: SelectOption[]
  dateType?: 'date' | 'daterange' | 'datetime' | 'datetimerange'
}

interface Props {
  title?: string
  searchItems: SearchItem[]
  showAddBtn?: boolean
  addBtnText?: string
  modelValue?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showAddBtn: false,
  addBtnText: '新增',
  modelValue: () => ({})
})

const emit = defineEmits<{
  (e: 'search', data: Record<string, any>): void
  (e: 'reset'): void
  (e: 'add'): void
  (e: 'update:modelValue', data: Record<string, any>): void
}>()

const searchData = reactive<Record<string, any>>({})

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(searchData, newVal)
  },
  { immediate: true, deep: true }
)

watch(
  searchData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const handleSearch = () => {
  emit('search', { ...searchData })
}

const handleReset = () => {
  Object.keys(searchData).forEach((key) => {
    searchData[key] = ''
  })
  emit('reset')
}

const handleAdd = () => {
  emit('add')
}
</script>

<style scoped>
.table-search {
  padding: 20px;
  background-color: #fff;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-header h2 {
  font-size: 24px;
  font-weight: normal;
  margin: 0;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  white-space: nowrap;
  color: #606266;
  font-size: 14px;
}

.search-actions {
  margin-top:20px;
  display: flex;
  gap: 10px;
  margin-left: auto;
}
</style>
