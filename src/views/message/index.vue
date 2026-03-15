<template>
  <div class="message">
    <h2 class="title">咨询记录</h2>
    
    <div class="message-list">
      <el-table :data="messageList">
        <el-table-column width="60">
          <template #default="scope">
            <el-avatar :size="40" :src="getAvatarUrl(scope.row.userNickname)">
              {{ scope.row.userNickname?.charAt(0).toUpperCase() }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="userNickname" label="会话ID" width="120" />
        <el-table-column label="情绪日志" min-width="400">
          <template #default="scope">
            <div class="session-title">{{ scope.row.sessionTitle }}</div>
            <div class="last-message">{{ scope.row.lastMessageContent }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="messageCount" label="消息数" width="80" />
        <el-table-column prop="lastMessageTime" label="时间" width="180" />
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleView(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.currentPage"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="loadMessageList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/utils/request'

const messageList = ref([])
const pagination = ref({ currentPage: 1, total: 0 })

const loadMessageList = async () => {
  try {
    const res = await request.get('/psychological-chat/sessions', {
      currentPage: pagination.value.currentPage.toString(),
      size: '10',
      emotionTag: ''
    })
    
    if (res.code === 200 || res.code === '200') {
      messageList.value = res.data?.records || []
      pagination.value.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取咨询记录失败:', error)
  }
}

const getAvatarUrl = (nickname: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || 'User')}&background=random&color=fff&size=40`
}

const handleView = (row: any) => {
  console.log('查看详情:', row)
}

onMounted(loadMessageList)
</script>

<style scoped>
.message {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100%;
}

.title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: bold;
  color: #304156;
}

.message-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.session-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #304156;
}

.last-message {
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-start;
}
</style>
