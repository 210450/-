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
    
    <!-- 文章列表 -->
    <div class="article-list">
      <el-table :data="knowledgeList" style="width: 100%">
        <el-table-column prop="title" label="文章标题" width="300" />
        <el-table-column prop="categoryName" label="分类" width="180" />
        <el-table-column prop="statusText" label="状态" width="100" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
  
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import TableSearch from '@/components/TableSearch/index.vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeCategory, KnowledgeArticle } from '@/api/knowledge'

const knowledgeCategory = ref<KnowledgeCategory[]>([])
const knowledgeList = ref<any[]>([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const searchParams = ref({
  title: '',
  categoryId: undefined as number | undefined,
  status: undefined as number | undefined
})

const searchItems = computed(() => {
  const items = [
    {
      key: 'title',
      label: '文章标题',
      type: 'input' as const,
      placeholder: '请输入文章标题'
    },
    {
      key: 'categoryId',
      label: '分类',
      type: 'select' as const,
      placeholder: '请选择分类',
      options: knowledgeCategory.value.map(item => ({
        label: item.categoryName,
        value: item.id
      }))
    },
    {
      key: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '已发布', value: 1 },
        { label: '草稿', value: 0 }
      ]
    }
  ]
  return items
})

const handleSearch = async (data: Record<string, any>) => {
  Object.assign(searchParams.value, {
    ...data,
    categoryId: data.categoryId ? Number(data.categoryId) : undefined,
    status: data.status ? Number(data.status) : undefined
  })
  pagination.value.currentPage = 1
  await loadKnowledgeList()
}

const loadKnowledgeList = async () => {
  try {
    const res = await knowledgeApi.getKnowledgeList({
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchParams.value
    } as any)
    
    console.log('API 返回结果:', res)
    
    // 判断成功的条件：code 为 200（数字或字符串）或者 message/msg 包含"成功"
    const isSuccess = res.code === 200 || res.code === '200' || res.message?.includes('成功') || res.msg?.includes('成功')
    
    if (isSuccess) {
      console.log('res.data:', res.data)
      console.log('res.data 类型:', typeof res.data)
      console.log('res.data 是否为数组:', Array.isArray(res.data))
      
      // 确保数据是数组格式
      if (Array.isArray(res.data)) {
        console.log('res.data 长度:', res.data.length)
        if (res.data.length > 0) {
          console.log('第一条数据:', res.data[0])
          console.log('数据结构:', Object.keys(res.data[0]))
        }
        knowledgeList.value = res.data
        pagination.value.total = res.data.length
      } else if (res.data?.list) {
        console.log('res.data.list 长度:', res.data.list.length)
        if (res.data.list.length > 0) {
          console.log('第一条数据:', res.data.list[0])
          console.log('数据结构:', Object.keys(res.data.list[0]))
        }
        knowledgeList.value = res.data.list
        pagination.value.total = res.data.total || 0
      } else if ((res.data as any)?.records) {
        console.log('res.data.records 长度:', (res.data as any).records.length)
        if ((res.data as any).records.length > 0) {
          console.log('第一条数据:', (res.data as any).records[0])
          console.log('数据结构:', Object.keys((res.data as any).records[0]))
        }
        knowledgeList.value = (res.data as any).records
        pagination.value.total = (res.data as any).total || 0
      } else {
        console.log('无数据')
        knowledgeList.value = []
        pagination.value.total = 0
      }
      
      console.log('更新后的知识文章数据:', knowledgeList.value)
      console.log('知识文章数据长度:', knowledgeList.value.length)
      console.log('表格数据绑定:', knowledgeList.value)
    } else {
      console.error('API 返回错误:', res.message || res.msg)
    }
  } catch (error) {
    console.error('获取知识文章列表失败:', error)
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadKnowledgeList()
}

const handleCurrentChange = (current: number) => {
  pagination.value.currentPage = current
  loadKnowledgeList()
}

const handleEdit = (row: KnowledgeArticle) => {
  console.log('编辑文章:', row)
}

const handleDelete = (id: number) => {
  console.log('删除文章:', id)
}

const handleReset = () => {
  searchParams.value = {
    title: '',
    categoryId: undefined,
    status: undefined
  }
  pagination.value.currentPage = 1
  loadKnowledgeList()
}

const handleAdd = () => {
  console.log('新增文章')
}

onMounted(async () => {
  // 加载分类列表
  try {
    const res = await knowledgeApi.getCategoryList()
    const isSuccess = res.code === 200 || res.code === '200' || res.message?.includes('成功') || (res as any).msg?.includes('成功')
    if (isSuccess) {
      knowledgeCategory.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
  
  // 加载文章列表
  await loadKnowledgeList()
})
</script>

<style scoped>
.knowledge {
  height: 100%;
  padding: 20px;
}

.article-list {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
