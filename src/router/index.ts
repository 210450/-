import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'UserLayout',
    component: () => import('../views/UserLayout/index.vue'),
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('../views/UserHome/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'consult',
        name: 'UserConsult',
        component: () => import('../views/UserConsult/index.vue'),
        meta: { title: 'AI咨询' }
      },
      {
        path: 'diary',
        name: 'UserDiary',
        component: () => import('../views/UserDiary/index.vue'),
        meta: { title: '情绪日记' }
      },
      {
        path: 'knowledge',
        name: 'UserKnowledge',
        component: () => import('../views/UserKnowledge/index.vue'),
        meta: { title: '知识库' }
      },
    ]
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/Layout/index.vue'),
    redirect: '/admin/data',
    children: [
      {
        path: 'data',
        name: 'AdminData',
        component: () => import('../views/data/index.vue'),
        meta: { title: '数据分析' }
      },
      {
        path: 'knowledge',
        name: 'AdminKnowledge',
        component: () => import('../views/Knowledge/index.vue'),
        meta: { title: '知识管理' }
      },
      {
        path: 'emotional',
        name: 'AdminEmotional',
        component: () => import('../views/emotional/index.vue'),
        meta: { title: '情绪日志' }
      },
      {
        path: 'message',
        name: 'AdminMessage',
        component: () => import('../views/message/index.vue'),
        meta: { title: '咨询记录' }
      }
    ]
  },
  {
    path: '/auth',
    name: 'Authout',
    component: () => import('../components/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/Login/index.vue'),
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('../views/Register/index.vue'),
        meta: { title: '注册' }
      }
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token') || ''
  if (to.path.startsWith('/auth')) {
    if (token && to.path !== '/auth/login') {
      const loginMode = localStorage.getItem('loginMode') || 'user'
      return { path: loginMode === 'admin' ? '/admin/data' : '/' }
    }
    return true
  }
  if (to.path === '/consult' || to.path === '/diary') {
    if (!token) return { path: '/auth/login', query: { redirect: to.fullPath, mode: 'user' } }
  }
  if (to.path.startsWith('/admin')) {
    if (!token) return { path: '/auth/login', query: { redirect: to.fullPath, mode: 'admin' } }
    const loginMode = localStorage.getItem('loginMode') || 'user'
    if (loginMode !== 'admin') return { path: '/' }
    const rawUserInfo = localStorage.getItem('userInfo') || ''
    if (rawUserInfo) {
      try {
        const info = JSON.parse(rawUserInfo) as { userType?: number }
        if (info.userType !== 2) return { path: '/' }
      } catch {
      }
    } else {
      return { path: '/' }
    }
  }
  return true
})

export default router
