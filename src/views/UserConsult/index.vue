<template>
  <div class="consult">
    <div class="container">
      <div class="layout">
        <aside class="sidebar">
          <div class="panel assistant">
            <div class="assistant-avatar">
              <img :src="robot" alt="robot" />
            </div>
            <div class="assistant-name">宁宁AI助手</div>
            <div class="assistant-status">
              <span class="dot"></span>
              <span>在线服务中</span>
            </div>
          </div>

          <div class="panel mood">
            <div class="panel-title panel-title-row">
              <span>情绪花园</span>
              <span class="panel-tag">待接入</span>
            </div>
            <div class="mood-main">
              <el-progress type="circle" :percentage="moodPercent" :width="86" :stroke-width="10" color="#f0b24b">
                <template #default>
                  <div class="mood-center">
                    <div class="mood-label">{{ moodLabel }}</div>
                    <div class="mood-score">{{ moodPercent }}</div>
                  </div>
                </template>
              </el-progress>
              <div class="mood-desc">
                <div class="mood-desc-title">情绪概览</div>
                <div class="mood-desc-value">{{ moodFeeling }}</div>
              </div>
            </div>
            <div class="mood-tip">
              <div class="tip-emoji">💝</div>
              <div class="tip-text">
                <div class="tip-title">给你的小建议</div>
                <div class="tip-sub">接入情绪日记后显示个性化建议</div>
              </div>
            </div>
          </div>

          <div class="panel history">
            <div class="panel-title">会话历史</div>
            <div v-if="!sessions.length" class="history-empty">暂无会话记录</div>
            <div v-else class="history-list">
              <div
                v-for="s in sessions"
                :key="s.id"
                class="history-item"
                :data-active="s.id === activeSessionId"
                @click="selectSession(s.id)"
              >
                <div class="history-item-title">{{ s.title }}</div>
                <div class="history-item-time">{{ s.timeText }}</div>
                <el-button
                  class="history-delete"
                  type="danger"
                  text
                  size="small"
                  :disabled="deletingId === s.id"
                  @click.stop="handleDeleteSession(s.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div v-if="sessions.length && sessions.length < pagination.total" class="history-more">
              <el-button size="small" :loading="pagination.loading" @click="loadMoreSessions">加载更多</el-button>
            </div>
          </div>
        </aside>

        <section class="main">
          <div class="chat-card">
            <div class="chat-top">
              <div class="chat-top-left">
                <div class="chat-top-avatar">
                  <img :src="robot" alt="robot" />
                </div>
                <div class="chat-top-text">
                  <div class="chat-top-title">宁宁AI助手</div>
                  <div class="chat-top-subtitle">您的贴心心理健康助手</div>
                </div>
              </div>
              <el-button class="chat-new-btn" circle @click="createDraftSession">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>

            <el-scrollbar class="chat-body" ref="scrollRef">
              <div class="chat-messages">
                <div v-if="messagesLoadError" class="chat-status chat-status-error">{{ messagesLoadError }}</div>
                <div v-if="messagesLoading && !activeMessages.length" class="chat-status">正在加载会话记录...</div>
                <div v-else-if="!activeMessages.length" class="chat-status">开始和宁宁聊聊吧</div>
                <div v-for="m in activeMessages" :key="m.id" :class="['chat-msg', m.role]">
                  <div :class="['chat-avatar', m.role]">
                    <img v-if="m.role === 'ai'" :src="robot" alt="ai" />
                    <img v-else :src="userAvatarUrl" alt="user" />
                  </div>
                  <div class="chat-bubble">
                    <div class="chat-text">{{ m.content }}</div>
                    <div class="chat-time">{{ m.timeText }}</div>
                  </div>
                </div>
              </div>
            </el-scrollbar>

            <div class="chat-composer">
              <div class="chat-input">
                <el-input
                  v-model="input"
                  type="textarea"
                  :rows="3"
                  :maxlength="500"
                  resize="none"
                  placeholder="请输入您想要分享的内容..."
                  @keydown.enter.exact.prevent="send"
                />
                <div class="chat-hint">
                  <span>按Enter发送，Shift+Enter换行</span>
                  <span>{{ input.length }}/500</span>
                </div>
              </div>
              <el-button class="send-btn" type="warning" :loading="sending" :disabled="sending || !input.trim()" @click="send">
                <el-icon><Promotion /></el-icon>
              </el-button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Plus, Promotion } from '@element-plus/icons-vue'
import robot from '@/assets/images/robot-fill.png'
import usersAvatar from '@/assets/images/users.png'
import { chatApi } from '@/api/chat'
import type { ChatMessage, ChatSession } from '@/api/chat'
import { ElMessage, ElMessageBox } from 'element-plus'

type Msg = {
  id: string
  role: 'user' | 'ai'
  content: string
  timeText: string
}

type Session = {
  id: string
  title: string
  timeText: string
  messages: Msg[]
}

const userAvatarUrl = computed(() => usersAvatar)

const nowText = () => {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const makeId = () => Math.random().toString(36).slice(2)
const isLocalSession = (id: string) => id.startsWith('local_')

const sessions = ref<Session[]>([])
const activeSessionId = ref<string>('')
const input = ref('')
const scrollRef = ref<any>(null)
const sending = ref(false)
const starting = ref(false)
const deletingId = ref('')
const messagesLoading = ref(false)
const messagesLoadError = ref('')
const streamController = ref<AbortController | null>(null)

const activeSession = computed(() => sessions.value.find((s) => s.id === activeSessionId.value) || null)
const activeMessages = computed(() => activeSession.value?.messages || [])

const moodPercent = ref(0)
const moodLabel = ref('待接入')
const moodFeeling = ref('完成情绪日记后显示')

const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  loading: false,
})

const toSession = (s: ChatSession): Session => {
  const time = s.startedAt || s.createdAt || s.updatedAt || ''
  const title = s.sessionTitle
    ? s.sessionTitle
    : s.lastMessage
    ? s.lastMessage.slice(0, 10)
    : s.userNickname
      ? `${s.userNickname} 的会话`
      : '咨询会话'
  return {
    id: String(s.id),
    title,
    timeText: time ? time.slice(0, 16).replace('T', ' ') : nowText(),
    messages: [],
  }
}

const toMsg = (m: ChatMessage): Msg => {
  const sender = (m as any).sender || (m as any).role || (m as any).from || (m as any).messageType
  const role = sender === 'ai' || sender === 'assistant' || sender === 1 ? 'ai' : 'user'
  const time = (m as any).sentAt || (m as any).createdAt || (m as any).time || ''
  const content =
    (m as any).content ||
    (m as any).message ||
    (m as any).text ||
    (m as any).answer ||
    (m as any).aiReply ||
    ''
  return {
    id: m.id ? String(m.id) : makeId(),
    role,
    content,
    timeText: time ? time.slice(11, 16) : '刚刚',
  }
}

const mergeSessions = (current: Session[], incoming: Session[]) => {
  const merged = current.slice()
  const indexMap = new Map<string, number>()
  merged.forEach((session, index) => {
    indexMap.set(session.id, index)
  })

  incoming.forEach((session) => {
    const existingIndex = indexMap.get(session.id)
    if (existingIndex === undefined) {
      indexMap.set(session.id, merged.length)
      merged.push(session)
      return
    }

    const existing = merged[existingIndex]
    merged[existingIndex] = {
      ...session,
      messages: existing.messages.length ? existing.messages : session.messages,
    }
  })

  return merged
}

const loadMessages = async (sessionId: string) => {
  const s = sessions.value.find((x) => x.id === sessionId)
  if (!s) return
  messagesLoadError.value = ''
  if (isLocalSession(sessionId)) return
  messagesLoading.value = true
  const previousMessages = s.messages.slice()
  try {
    const list = await chatApi.getSessionMessages(sessionId)
    s.messages = list.map(toMsg)
  } catch {
    s.messages = previousMessages
    messagesLoadError.value = '会话记录加载失败，请稍后重试'
  } finally {
    messagesLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const loadSessions = async (reset = false) => {
  if (pagination.value.loading) return
  pagination.value.loading = true
  try {
    if (reset) {
      pagination.value.pageNum = 1
      sessions.value = []
      activeSessionId.value = ''
    }
    const page = await chatApi.getSessions({
      pageNum: String(pagination.value.pageNum),
      pageSize: String(pagination.value.pageSize),
    })
    const list = page.list.map(toSession)
    sessions.value = reset ? list : mergeSessions(sessions.value, list)
    pagination.value.total = page.total
    if (!activeSessionId.value && sessions.value.length) {
      activeSessionId.value = sessions.value[0].id
      await loadMessages(activeSessionId.value)
    }
  } finally {
    pagination.value.loading = false
  }
}

const selectSession = async (id: string) => {
  activeSessionId.value = id
  await loadMessages(id)
}

const createLocalSession = (title = '新的会话') => {
  const s: Session = {
    id: `local_${makeId()}`,
    title,
    timeText: nowText(),
    messages: [
      {
        id: makeId(),
        role: 'ai',
        content: '你好，我在这里。你现在感觉怎么样？',
        timeText: '刚刚',
      },
    ],
  }
  sessions.value.unshift(s)
  activeSessionId.value = s.id
  return s
}

const createDraftSession = async () => {
  input.value = ''
  createLocalSession()
  await nextTick()
  scrollToBottom()
}

const createSession = async (
  initialMessage = '你好',
  sessionTitle = '新的会话',
  target?: Session | null,
  options?: { prefetchMessages?: boolean }
) => {
  const shouldPrefetch = options?.prefetchMessages ?? true
  if (starting.value) return
  starting.value = true
  try {
    const result = await chatApi.startSession({ initialMessage, sessionTitle })
    if (!result.sessionId) throw new Error('创建会话失败')
    const nextId = result.sessionId
    const nextTitle = result.sessionTitle || sessionTitle
    const nextMessages = result.messages.map(toMsg)
    if (target && isLocalSession(target.id)) {
      target.id = nextId
      target.title = nextTitle
      target.timeText = nowText()
      target.messages = nextMessages
      activeSessionId.value = target.id
      input.value = ''
      if (shouldPrefetch && !target.messages.length) await loadMessages(target.id)
      return target.id
    } else {
      const s: Session = {
        id: nextId,
        title: nextTitle,
        timeText: nowText(),
        messages: nextMessages,
      }
      sessions.value.unshift(s)
      pagination.value.total = Math.max(pagination.value.total, sessions.value.length)
      activeSessionId.value = s.id
      input.value = ''
      if (shouldPrefetch && !s.messages.length) await loadMessages(s.id)
      return s.id
    }
  } catch {
    if (!target) {
      createLocalSession(sessionTitle)
      input.value = ''
      await nextTick()
      scrollToBottom()
    }
    return ''
  } finally {
    starting.value = false
  }
}

const scrollToBottom = () => {
  const wrap = scrollRef.value?.wrapRef as HTMLElement | undefined
  if (!wrap) return
  wrap.scrollTop = wrap.scrollHeight
}

const send = async () => {
  const text = input.value.trim()
  if (!text || sending.value) return
  sending.value = true
  try {
    const originalText = text
    let id = activeSessionId.value
    let skipAppendUser = false
    if (!id || isLocalSession(id)) {
      const title = originalText.slice(0, 10) || '新的会话'
      const target = activeSession.value || createLocalSession(title)
      id = await createSession(originalText, title, target, { prefetchMessages: false })
      if (!id) {
        const s = activeSession.value || createLocalSession('新的会话')
        s.messages.push({ id: makeId(), role: 'user', content: originalText, timeText: '刚刚' })
        s.messages.push({ id: makeId(), role: 'ai', content: '（发送失败，请稍后再试）', timeText: '刚刚' })
        input.value = ''
        await nextTick()
        scrollToBottom()
        return
      }
      const created = activeSession.value
      const hasAi = Boolean(created?.messages.some((m) => m.role === 'ai' && m.content.trim()))
      if (hasAi) {
        return
      }
      skipAppendUser = Boolean(created?.messages.some((m) => m.role === 'user' && m.content.trim() === originalText))
    }

    const s = activeSession.value
    if (!s) return
    if (!skipAppendUser) {
      s.messages.push({ id: makeId(), role: 'user', content: originalText, timeText: '刚刚' })
    }
    input.value = ''
    streamController.value?.abort()
    const controller = new AbortController()
    streamController.value = controller

    const aiMsg: Msg = { id: makeId(), role: 'ai', content: '正在思考中...', timeText: '刚刚' }
    s.messages.push(aiMsg)
    await nextTick()
    scrollToBottom()

    let scrollPending = false
    const scheduleScroll = () => {
      if (scrollPending) return
      scrollPending = true
      requestAnimationFrame(() => {
        scrollPending = false
        scrollToBottom()
      })
    }

    const timeoutId = window.setTimeout(() => controller.abort(), 30000)
    try {
      await chatApi.streamChat({
        sessionId: id,
        userMessage: originalText,
        signal: controller.signal,
        onText: (chunk) => {
          if (aiMsg.content === '正在思考中...') aiMsg.content = ''
          aiMsg.content += chunk
          scheduleScroll()
        },
      })
    } catch (e: any) {
      const aborted = e?.name === 'AbortError' || String(e?.message || '').includes('aborted')
      aiMsg.content = aiMsg.content || (aborted ? '（已停止/超时）' : '（系统错误）')
    } finally {
      window.clearTimeout(timeoutId)
      if (streamController.value === controller) {
        streamController.value = null
      }
    }

    if (!aiMsg.content.trim()) {
      try {
        await loadMessages(id)
      } catch {
      }
      if (!aiMsg.content.trim()) {
        aiMsg.content = '（暂无回复）'
      }
    }
  } finally {
    sending.value = false
  }
}

const loadMoreSessions = async () => {
  const hasMore = sessions.value.length < pagination.value.total
  if (!hasMore) return
  pagination.value.pageNum += 1
  await loadSessions(false)
}

const handleDeleteSession = async (sessionId: string) => {
  const s = sessions.value.find((x) => x.id === sessionId)
  if (!s) return
  if (isLocalSession(sessionId)) {
    const idx = sessions.value.findIndex((x) => x.id === sessionId)
    if (idx >= 0) sessions.value.splice(idx, 1)
    if (activeSessionId.value === sessionId) {
      activeSessionId.value = sessions.value[0]?.id || ''
      if (activeSessionId.value) await loadMessages(activeSessionId.value)
    }
    return
  }
  try {
    await ElMessageBox.confirm('确认删除该会话吗？', '提示', { type: 'warning' })
  } catch {
    return
  }
  const idx = sessions.value.findIndex((x) => x.id === sessionId)
  deletingId.value = sessionId
  if (idx >= 0) sessions.value.splice(idx, 1)
  if (activeSessionId.value === sessionId) {
    activeSessionId.value = sessions.value[0]?.id || ''
    if (activeSessionId.value) await loadMessages(activeSessionId.value)
  }
  try {
    await chatApi.deleteSession(sessionId)
    ElMessage.success('删除成功')
    pagination.value.total = Math.max(0, pagination.value.total - 1)
  } catch (e: any) {
    await loadSessions(true)
    const stillExists = sessions.value.some((x) => x.id === sessionId)
    if (stillExists) {
      const msg = e?.responseData?.message || e?.message || '删除失败'
      ElMessage.error(msg)
    } else {
      ElMessage.success('删除成功')
    }
  } finally {
    deletingId.value = ''
  }
}

onMounted(() => {
  loadSessions(true)
})

onBeforeUnmount(() => {
  streamController.value?.abort()
})
</script>

<style scoped>
.consult {
  padding: 24px 0 40px;
  background: #f6f7fb;
  min-height: calc(100vh - 64px - 56px);
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  align-items: start;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(235, 238, 245, 0.9);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.assistant {
  display: grid;
  justify-items: center;
  padding: 18px 16px;
}

.assistant-avatar {
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  background: rgba(240, 178, 75, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-avatar img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.assistant-name {
  margin-top: 10px;
  font-weight: 700;
  font-size: 14px;
  color: #303133;
}

.assistant-status {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #67c23a;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #67c23a;
  box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.15);
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(240, 178, 75, 0.16);
  color: #c27a13;
  font-size: 12px;
  font-weight: 600;
}

.mood-main {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 14px;
  align-items: center;
}

.mood-center {
  display: grid;
  justify-items: center;
  gap: 2px;
}

.mood-label {
  font-size: 12px;
  color: #606266;
}

.mood-score {
  font-size: 18px;
  font-weight: 800;
  color: #303133;
}

.mood-desc-title {
  font-size: 12px;
  color: #909399;
}

.mood-desc-value {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
}

.mood-tip {
  margin-top: 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid rgba(235, 238, 245, 0.9);
  padding: 12px;
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: center;
}

.tip-emoji {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 178, 75, 0.15);
}

.tip-title {
  font-size: 12px;
  font-weight: 700;
  color: #303133;
}

.tip-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.history-empty {
  font-size: 12px;
  color: #c0c4cc;
  padding: 20px 0;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-more {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.history-item {
  border: 1px solid rgba(235, 238, 245, 0.9);
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  position: relative;
}

.history-delete {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.history-item[data-active='true'] {
  border-color: rgba(240, 178, 75, 0.7);
  box-shadow: 0 8px 16px rgba(240, 178, 75, 0.15);
}

.history-item-title {
  font-size: 13px;
  font-weight: 700;
  color: #303133;
}

.history-item-time {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.main {
  min-width: 0;
}

.chat-card {
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(235, 238, 245, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.chat-top {
  height: 64px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #e08a1a 0%, #f0a640 100%);
}

.chat-top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}

.chat-top-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-top-avatar img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.chat-top-title {
  font-size: 14px;
  font-weight: 800;
}

.chat-top-subtitle {
  margin-top: 2px;
  font-size: 12px;
  opacity: 0.9;
}

.chat-new-btn {
  border: none;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.chat-body {
  height: 520px;
  background: radial-gradient(ellipse at top, rgba(240, 178, 75, 0.14), transparent 60%);
}

.chat-messages {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.chat-status {
  align-self: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(235, 238, 245, 0.9);
  color: #909399;
  font-size: 13px;
}

.chat-status-error {
  align-self: stretch;
  background: rgba(254, 240, 240, 0.9);
  border-color: rgba(245, 108, 108, 0.25);
  color: #c45656;
}

.chat-msg.user {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.chat-msg.ai {
  justify-content: flex-start;
}

.chat-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(235, 238, 245, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  overflow: hidden;
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 0;
}

.chat-avatar.ai {
  background: rgba(240, 178, 75, 0.45);
  border-color: rgba(240, 178, 75, 0.55);
}

.chat-avatar.ai img {
  object-fit: contain;
  width: 20px;
  height: 20px;
  padding: 0;
  filter: brightness(0) invert(1);
}

.chat-avatar.user img {
  object-fit: cover;
}

.chat-bubble {
  max-width: 78%;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(235, 238, 245, 0.9);
  background: #fff;
}

.chat-msg.ai .chat-bubble {
  background: rgba(255, 244, 223, 0.95);
  border-color: rgba(240, 178, 75, 0.32);
}

.chat-msg.user .chat-bubble {
  background: rgba(240, 178, 75, 0.32);
  border-color: rgba(240, 178, 75, 0.32);
}

.chat-text {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-time {
  margin-top: 10px;
  font-size: 12px;
  color: #c0c4cc;
}

.chat-composer {
  display: grid;
  grid-template-columns: 1fr 48px;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(235, 238, 245, 0.9);
  background: rgba(255, 255, 255, 0.95);
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-hint {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c0c4cc;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  padding: 0;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
