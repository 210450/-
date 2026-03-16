<template>
  <el-dialog
    v-model="visible"
    title="咨询会话详情"
    width="800px"
    :close-on-click-modal="false"
  >
    <!-- 会话基本信息 -->
    <div class="session-info">
      <div class="info-item">
        <span class="label">用户：</span>
        <span class="value">{{ sessionInfo.userNickname }}</span>
      </div>
      <div class="info-item">
        <span class="label">开始时间：</span>
        <span class="value">{{ sessionInfo.startedAt }}</span>
      </div>
      <div class="info-item">
        <span class="label">消息数：</span>
        <span class="value">{{ messages.length }}条</span>
      </div>
    </div>

    <!-- 对话记录 -->
    <div class="chat-messages">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="['message-item', msg.sender === 'user' ? 'user-message' : 'ai-message']"
      >
        <div class="message-sender">{{ msg.sender === 'user' ? '用户' : 'AI助手' }}</div>
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-time">{{ msg.sentAt }}</div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { request } from '@/utils/request'

const props = defineProps<{
  visible: boolean
  sessionId: string
  sessionInfo: any
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const visible = ref(props.visible)
const messages = ref<any[]>([])

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  visible.value = newVal
  if (newVal && props.sessionId) {
    loadMessages()
  }
}, { immediate: true })

// 监听 sessionId 变化
watch(() => props.sessionId, (newVal) => {
  if (props.visible && newVal) {
    loadMessages()
  }
})

// 加载消息列表
const loadMessages = async () => {
  if (!props.sessionId) return
  
  try {
    const res = await request.get(`/psychological-chat/sessions/${props.sessionId}/messages`)
    
    if (res.code === 200 || res.code === '200') {
      messages.value = res.data?.messages || res.data || []
    }
  } catch (error) {
    console.error('获取会话消息失败:', error)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  // 清理可能的异步操作或定时器
  messages.value = []
})

// 组件挂载时加载数据
onMounted(() => {
  if (props.visible && props.sessionId) {
    loadMessages()
  }
})
</script>

<style scoped>
.session-info {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.value {
  color: #304156;
}

.chat-messages {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.message-item {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
  position: relative;
}

.user-message {
  background-color: #ecf5ff;
  align-self: flex-start;
}

.ai-message {
  background-color: #f0f9eb;
  align-self: flex-start;
}

.message-sender {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #304156;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
