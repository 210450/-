import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import router from '@/router'

export type UserInfo = {
  id?: number
  username?: string
  nickname?: string
  email?: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLogin = computed(() => Boolean(token.value))

  const setToken = (t: string) => {
    token.value = t
    if (t) {
      localStorage.setItem('token', t)
    } else {
      localStorage.removeItem('token')
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
      userInfo.value = ui
    } else {
      userInfo.value = { username: params.account, nickname: params.account }
    }
    return res
  }

  const getCode = async (params: Record<string, any>) => {
    return await authApi.getCode(params)
  }

  const authentication = async (params: Record<string, any>) => {
    return await authApi.authentication(params)
  }

  const logout = (redirect?: string) => {
    setToken('')
    userInfo.value = null
    const current = router.currentRoute.value.fullPath
    const finalRedirect = redirect ?? (current.startsWith('/auth') ? '' : current)
    router.replace(finalRedirect ? { path: '/auth/login', query: { redirect: finalRedirect } } : '/auth/login')
  }

  return {
    token,
    userInfo,
    isLogin,
    setToken,
    login,
    getCode,
    authentication,
    logout,
  }
})
