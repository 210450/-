import { request } from '@/utils/request'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type UserInfo = {
  id?: number | string
  username?: string
  email?: string
  avatar?: string
  userType?: number
}

export type LoginParams = Record<string, any>

export type LoginResult = ApiResponse<{
  token: string
  userInfo?: UserInfo
}>

export type RegisterParams = {
  username: string
  email: string
  nickname?: string
  phone?: string
  password: string
  confirmPassword: string
  gender: number
  userType: number
}

export const authApi = {
  login(params: LoginParams) {
    return request.post<LoginResult>('/user/login', params)
  },
  register(params: RegisterParams) {
    return request.post<ApiResponse<any>>('/user/add', params)
  },
  getCode(params: Record<string, any>) {
    return request.get<ApiResponse<any>>('/get/code', params)
  },
  authentication(params: Record<string, any>) {
    return request.post<ApiResponse<any>>('/user/authentication', params)
  },
}
