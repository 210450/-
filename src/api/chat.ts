import { request } from '@/utils/request'

export type ChatSession = {
  id: string
  userNickname?: string
  sessionTitle?: string
  startedAt?: string
  createdAt?: string
  updatedAt?: string
  lastMessage?: string
}

export type ChatMessage = {
  id?: string
  sender?: 'user' | 'ai'
  role?: 'user' | 'ai'
  content: string
  sentAt?: string
  createdAt?: string
}

export type SessionsPage = {
  list: ChatSession[]
  total: number
}

export type StartSessionResult = {
  sessionId: string
  sessionTitle?: string
  messages: ChatMessage[]
  raw: any
}

export type StreamChatParams = {
  sessionId: string
  userMessage: string
  signal?: AbortSignal
  onText: (chunk: string) => void
  onDone?: () => void
}

const unwrap = (res: any) => {
  const raw = res?.data ?? res
  return raw?.data ?? raw
}

const asArray = (v: any) => (Array.isArray(v) ? v : [])

const pickSessionId = (payload: any) => {
  return payload?.sessionId || payload?.id || payload?.data?.sessionId || payload?.data?.id || ''
}

const pickMessages = (payload: any) => {
  const p = payload?.data ?? payload
  if (Array.isArray(p)) return p
  return p?.messages || p?.messageList || []
}

const extractToken = () => {
  const token = localStorage.getItem('token') || ''
  if (!token) return ''
  return token.startsWith('Bearer ') ? token.slice(7) : token
}

const extractChunk = (data: any) => {
  if (!data) return ''
  if (typeof data === 'string') return data
  const candidate =
    data?.delta?.content ??
    data?.content ??
    data?.text ??
    data?.answer ??
    data?.aiReply ??
    data?.message ??
    data?.result?.content ??
    data?.result?.text ??
    data?.data?.content ??
    data?.data?.text ??
    data?.data?.answer ??
    data?.data?.aiReply ??
    data?.choices?.[0]?.delta?.content ??
    data?.choices?.[0]?.message?.content
  return typeof candidate === 'string' ? candidate : ''
}

const parseSseData = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return { done: false, text: '' }
  if (trimmed === '[DONE]') return { done: true, text: '' }
  try {
    const json = JSON.parse(trimmed)
    const done = Boolean(json?.done) || json?.finish_reason === 'stop' || json?.choices?.[0]?.finish_reason === 'stop'
    return { done, text: extractChunk(json) }
  } catch {
    return { done: false, text: trimmed }
  }
}

export const chatApi = {
  async getSessions(params: { pageNum: string; pageSize: string }): Promise<SessionsPage> {
    const res: any = await request.get<any>(
      '/psychological-chat/sessions',
      {
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        currentPage: params.pageNum,
        size: params.pageSize,
      },
      { silent: true }
    )
    const payload = unwrap(res)
    const records = payload?.records || payload?.list || payload?.rows || []
    const total = payload?.total || payload?.totalCount || payload?.count || 0
    return { list: asArray(records), total: Number(total) || 0 }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const res: any = await request.get<any>(`/psychological-chat/sessions/${sessionId}/messages`, undefined, { silent: true })
    const payload = unwrap(res)
    const list = Array.isArray(payload) ? payload : payload?.messages || payload?.messageList || payload || []
    return asArray(list)
  },

  async startSession(data: { initialMessage: string; sessionTitle: string }): Promise<StartSessionResult> {
    try {
      const res: any = await request.post<any>('/psychological-chat/session/start', data, { silent: true })
      const raw = res?.data ?? res
      const payload = unwrap(res)
      return {
        sessionId: String(pickSessionId(payload) || ''),
        sessionTitle: payload?.sessionTitle || payload?.data?.sessionTitle,
        messages: asArray(pickMessages(payload)),
        raw,
      }
    } catch (e: any) {
      const raw = e?.responseData ?? e?.response?.data ?? e
      const payload = unwrap(raw)
      const sessionId = String(pickSessionId(payload) || '')
      if (sessionId) {
        return {
          sessionId,
          sessionTitle: payload?.sessionTitle || payload?.data?.sessionTitle,
          messages: asArray(pickMessages(payload)),
          raw,
        }
      }
      throw e
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    await request.delete<any>(`/psychological-chat/sessions/${sessionId}`, undefined, { silent: true })
  },

  async streamChat(params: StreamChatParams): Promise<void> {
    const token = extractToken()
    const res = await fetch('/api/psychological-chat/stream', {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        token,
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ sessionId: params.sessionId, userMessage: params.userMessage }),
      signal: params.signal,
    })

    if (!res.ok) {
      throw new Error(`stream failed: ${res.status}`)
    }

    const contentType = String(res.headers.get('content-type') || '').toLowerCase()
    if (contentType.includes('application/json')) {
      const json = await res.json()
      const payload = json?.data ?? json
      const text = extractChunk(payload)
      if (text) params.onText(text)
      params.onDone?.()
      return
    }

    if (!res.body) {
      const text = await res.text()
      if (text) params.onText(text)
      params.onDone?.()
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let done = false
    const readWithTimeout = async (ms: number) => {
      return (await Promise.race([
        reader.read(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
      ])) as ReadableStreamReadResult<Uint8Array> | null
    }
    const processFrame = (frame: string) => {
      const lines = frame.split('\n')
      const dataLines = lines
        .map((l) => l.trim())
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trimStart())
      const data = dataLines.length ? dataLines.join('\n') : frame.trim()
      if (!data) return false
      const parsed = parseSseData(data)
      if (parsed.text) params.onText(parsed.text)
      return parsed.done
    }

    while (!done) {
      const chunk = await readWithTimeout(30000)
      if (chunk === null) {
        done = true
        try {
          await reader.cancel()
        } catch {
        }
        break
      }
      done = chunk.done
      buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !done })
      buffer = buffer.replace(/\r\n/g, '\n')
      let splitIndex = buffer.indexOf('\n\n')
      while (splitIndex >= 0) {
        const frame = buffer.slice(0, splitIndex)
        buffer = buffer.slice(splitIndex + 2)
        if (processFrame(frame)) {
          done = true
          break
        }
        splitIndex = buffer.indexOf('\n\n')
      }
      if (done) break

      const rows = buffer.split('\n')
      buffer = rows.pop() || ''
      for (const row of rows) {
        if (!row.trim().startsWith('data:')) continue
        if (processFrame(row)) {
          done = true
          break
        }
      }
    }

    if (buffer.trim()) {
      processFrame(buffer.trim())
    }

    params.onDone?.()
  },
}
