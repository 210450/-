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
        <el-table-column prop="authorName" label="作者" width="100" />      
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
          layout="prev, pager, next"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
  
  <!-- 新增/编辑文章弹框 -->
  <ArticleForm
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    :categories="knowledgeCategory"
    :article="currentArticle"
    @submit="handleArticleSubmit"
    @close="handleDialogClose"
  />
  
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import TableSearch from '@/components/TableSearch/index.vue'
import ArticleForm from './components/ArticleForm.vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeCategory, KnowledgeArticle } from '@/api/knowledge'

const knowledgeCategory = ref<KnowledgeCategory[]>([])
const knowledgeList = ref<any[]>([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 弹框相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增文章')
const currentArticle = ref<KnowledgeArticle | null>(null)

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
        { label: '已下线', value: 0 }
      ]
    }
  ]
  return items
})

const handleSearch = async (data: Record<string, any>) => {
  Object.assign(searchParams.value, {
    ...data,
    categoryId: data.categoryId ? Number(data.categoryId) : undefined,
    status: data.status !== undefined ? Number(data.status) : undefined
  })
  pagination.value.currentPage = 1
  await loadKnowledgeList()
}

const loadKnowledgeList = async () => {
  try {
    const params = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      ...searchParams.value
    }
    
    console.log('分页参数:', params)
    
    const res = await knowledgeApi.getKnowledgeList(params as any)
    
    console.log('API 响应:', res)
    
    // 判断成功的条件：code 为 200（数字或字符串）或者 message/msg 包含"成功"
    const isSuccess = res.code === 200 || res.code === '200' || res.message?.includes('成功') || res.msg?.includes('成功')
    
    if (isSuccess) {
      const data = res.data
      
      console.log('响应数据:', data)
      
      // 处理不同的数据结构
      if (Array.isArray(data)) {
        knowledgeList.value = data
        pagination.value.total = data.length
      } else if (data?.list) {
        knowledgeList.value = data.list
        pagination.value.total = data.total || 0
      } else if ((data as any)?.records) {
        knowledgeList.value = (data as any).records
        pagination.value.total = (data as any).total || 0
      } else {
        knowledgeList.value = []
        pagination.value.total = 0
      }
      
      console.log('当前页:', pagination.value.currentPage, '总记录数:', pagination.value.total, '当前数据量:', knowledgeList.value.length)
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

const handleAdd = () => {
  dialogTitle.value = '新增文章'
  currentArticle.value = null
  dialogVisible.value = true
}

const handleEdit = (row: KnowledgeArticle) => {
  dialogTitle.value = '编辑文章'
  currentArticle.value = row
  dialogVisible.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'delete-message-box'
    })
    
    console.log('删除文章:', id)
    
    const res = await knowledgeApi.deleteArticle(id)
    
    console.log('删除结果:', res)
    
    ElMessage.success('删除成功')
    
    // 重新加载文章列表
    await loadKnowledgeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
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

// 处理文章提交
const handleArticleSubmit = async () => {
  try {
    // 模拟保存成功
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('文章保存成功')
    dialogVisible.value = false
    // 重新加载文章列表
    await loadKnowledgeList()
  } catch (error) {
    console.error('保存文章失败:', error)
  }
}

// 处理对话框关闭
const handleDialogClose = () => {
  currentArticle.value = null
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
  justify-content: flex-start;
}
</style>
