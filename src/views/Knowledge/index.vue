<template>
  <div class="knowledge">
    <TableSearch
      title="知识文章"
      v-model="searchModel"
      :searchItems="searchItems"
      :showAddBtn="false"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #actions>
        <el-button type="primary" @click="openCreate">新增</el-button>
        <el-button :disabled="!selectedArticle" @click="openEditSelected">编辑</el-button>
      </template>
    </TableSearch>

    <div class="table-wrap">
      <el-table :data="tableData" style="width: 100%" @current-change="handleCurrentChange" highlight-current-row>
        <el-table-column prop="title" label="文章标题" min-width="260" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="140" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="140" show-overflow-tooltip />
        <el-table-column prop="readCount" label="阅读量" width="100" />
        <el-table-column prop="publishedAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="openEdit(scope.row)">编辑</el-button>
            <el-button type="success" link @click="togglePublish(scope.row)">
              {{ scope.row.status === 1 ? '下线' : '发布' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="!tableData.length" class="empty">暂无数据</div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="loadList"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <ArticleForm
      v-model:visible="formVisible"
      :title="formTitle"
      :categories="categories"
      :article="currentArticle"
      @submit="handleFormSubmit"
      @close="handleFormClose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TableSearch from '@/components/TableSearch/index.vue'
import ArticleForm from './components/ArticleForm.vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeArticle, KnowledgeCategory } from '@/api/knowledge'

const loading = ref(false)

const categories = ref<KnowledgeCategory[]>([])
const tableData = ref<KnowledgeArticle[]>([])
const selectedArticle = ref<KnowledgeArticle | null>(null)

const pagination = ref({
  current: 1,
  size: 10,
  total: 0,
})

const searchModel = ref<Record<string, any>>({
  title: '',
  categoryId: '',
  status: '',
})

const categoryOptions = computed(() => {
  return categories.value.map((c) => ({ label: c.categoryName, value: c.id }))
})

const searchItems = computed(() => [
  {
    key: 'title',
    label: '文章标题',
    type: 'input' as const,
    placeholder: '请输入文章标题',
    width: '240px',
  },
  {
    key: 'categoryId',
    label: '分类',
    type: 'select' as const,
    placeholder: '请选择分类',
    width: '200px',
    options: categoryOptions.value,
  },
  {
    key: 'status',
    label: '状态',
    type: 'select' as const,
    placeholder: '请选择文章状态',
    width: '200px',
    options: [
      { label: '已发布', value: 1 },
      { label: '草稿', value: 0 },
      { label: '已下架', value: 2 },
    ],
  },
])

const loadCategories = async () => {
  const res: any = await knowledgeApi.getCategoryList()
  const raw = res?.data?.data || res?.data || res
  const list = Array.isArray(raw) ? raw : []
  const result: KnowledgeCategory[] = []
  const walk = (nodes: any[]) => {
    nodes.forEach((n) => {
      result.push(n)
      if (Array.isArray(n.children) && n.children.length) {
        walk(n.children)
      }
    })
  }
  walk(list)
  categories.value = result
}

const loadList = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.value.current,
      size: pagination.value.size,
      title: searchModel.value.title || undefined,
      categoryId: searchModel.value.categoryId ? Number(searchModel.value.categoryId) : undefined,
      status: searchModel.value.status === '' ? undefined : Number(searchModel.value.status),
    }
    const res: any = await knowledgeApi.getKnowledgeList(params)
    const raw = res?.data ?? res
    const pageData = raw?.data ?? raw
    const list = pageData?.list || pageData?.records || pageData?.rows || []
    const total = pageData?.total || pageData?.totalCount || pageData?.count || 0
    tableData.value = Array.isArray(list) ? list : []
    pagination.value.total = Number(total) || 0
    if (selectedArticle.value) {
      selectedArticle.value =
        tableData.value.find((x) => x.id === selectedArticle.value?.id) || null
    }
  } catch (error: any) {
    console.error(error)
    tableData.value = []
    pagination.value.total = 0
    ElMessage.error(error?.message || '获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadList()
}

const handleReset = () => {
  searchModel.value = { title: '', categoryId: '', status: '' }
  pagination.value.current = 1
  loadList()
}

const handleSizeChange = () => {
  pagination.value.current = 1
  loadList()
}

const formVisible = ref(false)
const formTitle = ref('新增文章')
const currentArticle = ref<KnowledgeArticle | null>(null)

const openCreate = () => {
  formTitle.value = '新增文章'
  currentArticle.value = null
  formVisible.value = true
}

const openEdit = async (row: KnowledgeArticle) => {
  formTitle.value = '编辑文章'
  const res: any = await knowledgeApi.getArticleDetail(row.id)
  const raw = res?.data ?? res
  const detail = raw?.data ?? raw
  currentArticle.value = detail
  formVisible.value = true
}

const openEditSelected = async () => {
  if (!selectedArticle.value) return
  await openEdit(selectedArticle.value)
}

const handleCurrentChange = (row: KnowledgeArticle | null) => {
  selectedArticle.value = row
}

const handleFormSubmit = async () => {
  formVisible.value = false
  await loadList()
  ElMessage.success('保存成功')
}

const handleFormClose = () => {
  formVisible.value = false
}

const handleDelete = async (row: KnowledgeArticle) => {
  await ElMessageBox.confirm('确认删除该文章吗？', '提示', { type: 'warning' })
  await knowledgeApi.deleteArticle(row.id.toString())
  ElMessage.success('删除成功')
  loadList()
}

const togglePublish = async (row: KnowledgeArticle) => {
  const nextStatus = row.status === 1 ? 2 : 1
  const confirmText = nextStatus === 1 ? '确认发布该文章吗？' : '确认下线该文章吗？'
  await ElMessageBox.confirm(confirmText, '提示', { type: 'warning' })
  const detailRes: any = await knowledgeApi.getArticleDetail(row.id)
  const detailRaw = detailRes?.data ?? detailRes
  const detail = detailRaw?.data ?? detailRaw
  await knowledgeApi.updateArticle(row.id, {
    id: row.id,
    title: detail.title,
    categoryId: Number(detail.categoryId),
    summary: detail.summary || '',
    tags: detail.tags || '',
    coverImage: detail.coverImage || '',
    content: detail.content || '',
    status: nextStatus,
  })
  ElMessage.success(nextStatus === 1 ? '已发布' : '已下线')
  loadList()
}

onMounted(async () => {
  await loadCategories()
  await loadList()
})
</script>

<style scoped>
.knowledge {
  padding: 20px;
  background-color: #f0f2f5;
  height: 100%;
}

.table-wrap {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading,
.empty {
  padding: 16px 0 0;
  color: #909399;
  font-size: 14px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-start;
}
</style>
