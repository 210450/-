import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import router from '@/router'
import type { RegisterParams } from '@/api/auth'

export type UserInfo = {
  id?: number
  username?: string
  nickname?: string
  email?: string
  avatar?: string
  userType?: number
}

export const useUserStore = defineStore('user', () => {
  const loadUserInfo = () => {
    const raw = localStorage.getItem('userInfo')
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserInfo
    } catch {
      localStorage.removeItem('userInfo')
      return null
    }
  }

  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(loadUserInfo())
  const isLogin = computed(() => Boolean(token.value))

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info))
    } else {
      localStorage.removeItem('userInfo')
    }
  }

  const setToken = (t: string) => {
    token.value = t
    if (t) {
      localStorage.setItem('token', t)
    } else {
      localStorage.removeItem('token')
      setUserInfo(null)
    }
  }

  const login = async (params: { account: string; password: string }) => {
    const loginParams = {
      username: params.account,
      password: params.password,
    }
    const res: any = await authApi.login(loginParams)
    const tk = res?.data?.token
    if (!tk) {
      throw new Error(res?.message || '登录失败')
    }
    setToken(tk)
    const ui = res?.data?.userInfo
    if (ui) {
      setUserInfo(ui)
    } else {
      setUserInfo({ username: params.account, nickname: params.account })
    }
    return res
  }

  const getCode = async (params: Record<string, any>) => {
    return await authApi.getCode(params)
  }

  const authentication = async (params: Record<string, any>) => {
    return await authApi.authentication(params)
  }

  const register = async (params: RegisterParams) => {
    return await authApi.register(params)
  }

  const logout = (redirect?: string) => {
    localStorage.removeItem('loginMode')
    setToken('')
    setUserInfo(null)
    const current = router.currentRoute.value.fullPath
    const finalRedirect = redirect ?? (current.startsWith('/auth') ? '' : current)
    router.replace(finalRedirect ? { path: '/auth/login', query: { redirect: finalRedirect } } : '/auth/login')
  }

  return {
    token,
    userInfo,
    isLogin,
    setToken,
    setUserInfo,
    login,
    getCode,
    authentication,
    register,
    logout,
  }
})
