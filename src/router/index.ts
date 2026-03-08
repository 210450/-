import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout/index.vue'),
    children: [
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
        meta: { title: '咨询记录' }
      },
    ]
  },
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router