import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import router from '@/router'

export type UserInfo = {
  id?: number
  username?: string
  nickname?: string
  email?: string
  avatar?: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as UserInfo | null,
  }),
  
  getters: {
    isLogin: (state) => Boolean(state.token),
  },
  
  actions: {
    // 设置 token
    setToken(token: string) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    
    // 登录
    async login(params: { account: string; password: string }) {
      const loginParams = {
        username: params.account,
        password: params.password
      }
      const res: any = await authApi.login(loginParams)
      const token = res?.data?.token
      if (!token) {
        throw new Error(res?.message || '登录失败')
      }
      this.setToken(token)
      const userInfo = res?.data?.userInfo
      if (userInfo) {
        this.userInfo = userInfo
      } else {
        this.userInfo = { username: params.account, nickname: params.account }
      }
      return res
    },

    async getCode(params: Record<string, any>) {
      return await authApi.getCode(params)
    },

    async authentication(params: Record<string, any>) {
      return await authApi.authentication(params)
    },
    
    // 退出登录
    logout() {
      this.setToken('')
      this.userInfo = null
      router.push('/auth/login')
    }
  }
})
