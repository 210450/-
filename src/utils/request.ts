import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const toLogin = () => {
  const current = router.currentRoute.value.fullPath
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('loginMode')
  try {
    if (getActivePinia()) {
      const userStore = useUserStore()
      userStore.setToken('')
      userStore.userInfo = null
    }
  } catch {
  }
  if (current && !current.startsWith('/auth')) {
    router.replace({ path: '/auth/login', query: { redirect: current } })
  } else {
    router.replace('/auth/login')
  }
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      const authorizationValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      config.headers.Authorization = authorizationValue
      config.headers.token = token.startsWith('Bearer ') ? token.slice(7) : token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    const url = String(response?.config?.url || '')
    const silent = Boolean((response.config as any)?.silent) || url.includes('/psychological-chat/')
    if (url.includes('/psychological-chat/session/start')) {
      const data = res?.data ?? res
      if (data?.sessionId || data?.id || data?.data?.sessionId || data?.data?.id) {
        return res
      }
    }
    const success =
      res?.success === true ||
      res?.code === 200 ||
      res?.code === '200' ||
      res?.code === 0 ||
      res?.code === '0'
    if (success) {
      return res
    } else if (res.code === -2) {
      if (!silent) ElMessage.error('登录已过期，请重新登录')
      toLogin()
      const err: any = new Error(res.message || 'token错误')
      err.responseData = res
      return Promise.reject(err)
    } else {
      if (!silent) ElMessage.error(res.message || '请求失败')
      const err: any = new Error(res.message || '请求失败')
      err.responseData = res
      return Promise.reject(err)
    }
  },
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url || '')
    const silent = Boolean(error?.config?.silent) || url.includes('/psychological-chat/')
    if (status === 401 || status === 403) {
      if (!silent) ElMessage.error('登录已过期，请重新登录')
      toLogin()
      return Promise.reject(error)
    }
    if (!silent) ElMessage.error(error?.message || '网络错误')
    return Promise.reject(error)
  }
)

interface RequestConfig extends AxiosRequestConfig {
  data?: any
  params?: any
  silent?: boolean
}

export const request = {
  get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return service.get(url, { params, ...config })
  },
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return service.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
    return service.delete(url, { params, ...config })
  }
}

export default service
