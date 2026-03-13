import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout/index.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/data/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'data',
        name: 'Data',
        component: () => import('../views/data/index.vue'),
        meta: { title: '数据分析' }
      },
      {
        path: 'Knowledge',
        name: 'Knowledge',
        component: () => import('../views/Knowledge/index.vue'),
        meta: { title: '知识管理' }
      },
      {
        path: 'emotional',
        name: 'Emotional',
        component: () => import('../views/emotional/index.vue'),
        meta: { title: '情绪日志' }
      },
      {
        path: 'message',
        name: 'message',
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
  if (to.path === '/') return true
  if (to.path.startsWith('/auth')) {
    if (token && to.path !== '/auth/login') return { path: '/data' }
    return true
  }
  if (!token) return { path: '/auth/login', query: { redirect: to.fullPath } }
  return true
})

export default router
