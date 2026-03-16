import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      const authorizationValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      config.headers.Authorization = authorizationValue
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
    const success =
      res?.success === true ||
      res?.code === 200 ||
      res?.code === '200' ||
      res?.code === 0 ||
      res?.code === '0'
    if (success) {
      return res
    } else if (res.code === -2) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/auth/login')
      return Promise.reject(new Error(res.message || 'token错误'))
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
//  当 HTTP 状态码异常或网络不通时触发。
//  显示错误消息（优先使用 error.message，否则默认“网络错误”）。
//  将错误对象继续 rejected 传递，方便调用方进一步处理。
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

interface RequestConfig extends AxiosRequestConfig {
  data?: any
  params?: any
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
