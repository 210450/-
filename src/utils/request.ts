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
    console.log('API 响应:', res)
    console.log('API 响应状态码:', response.status)
    if (res.code === 200 || res.code === '200' || res.success === true) {
      return res
    } else if (res.code === -2 || res.code === '-2') {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/auth/login')
      return Promise.reject(new Error(res.message || 'token错误'))
    } else {
      const errorMessage = res.message || res.msg || '请求失败'
      console.error('API 错误:', errorMessage)
      console.error('完整错误响应:', res)
      ElMessage.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error) => {
    console.error('网络错误:', error)
    console.error('错误响应:', error.response)
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
