<template>
  <div class="knowledge">
    <div class="container">
      <div class="header">
        <h1 class="title">知识库</h1>
        <div class="filters">
          <el-input v-model="keyword" placeholder="搜索标题" class="input" clearable @keyup.enter="load" />
          <el-button type="primary" @click="load">搜索</el-button>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="card" shadow="hover">
            <div class="cover">
              <img v-if="item.coverImage" :src="fileUrl(item.coverImage)" alt="cover" />
              <div v-else class="cover-placeholder"></div>
            </div>
            <div class="body">
              <div class="card-title" :title="item.title">{{ item.title }}</div>
              <div class="summary" :title="item.summary">{{ item.summary }}</div>
              <div class="meta">
                <span>{{ item.categoryName }}</span>
                <span>{{ item.readCount || 0 }} 阅读</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div v-if="loading" class="status">加载中...</div>
      <div v-else-if="!list.length" class="status">暂无数据</div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="prev, pager, next"
          :page-sizes="[12, 24, 48]"
          @current-change="load"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeArticle } from '@/api/knowledge'

const loading = ref(false)
const keyword = ref('')
const list = ref<KnowledgeArticle[]>([])

const pagination = ref({
  current: 1,
  size: 12,
  total: 0,
})

const fileUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${location.origin}/api${path}`
}

const load = async () => {
  loading.value = true
  try {
    const res: any = await knowledgeApi.getKnowledgeList({
      current: pagination.value.current,
      size: pagination.value.size,
      title: keyword.value || undefined,
      status: 1,
    })
    const raw = res?.data ?? res
    const pageData = raw?.data ?? raw
    list.value = Array.isArray(pageData?.list) ? pageData.list : []
    pagination.value.total = Number(pageData?.total || 0)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  pagination.value.current = 1
  load()
}

onMounted(load)
</script>

<style scoped>
.knowledge {
  padding: 24px 0 40px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 56px);
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input {
  width: 240px;
}

.card {
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}

.cover {
  height: 140px;
  background: #e9eef3;
  overflow: hidden;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e7effa 0%, #eaf7f5 100%);
}

.body {
  padding: 12px 12px 14px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  height: 34px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.status {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 10px 0;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>
