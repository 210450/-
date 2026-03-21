<template>
  <header class="user-header">
    <div class="container header-inner">
      <router-link to="/" class="brand">
        <img class="brand-logo" :src="logo" alt="logo" />
        <span class="brand-title">心理健康AI助手</span>
      </router-link>

      <nav class="nav">
        <router-link class="nav-link" to="/">首页</router-link>
        <template v-if="userStore.isLogin">
          <router-link class="nav-link" to="/consult">AI咨询</router-link>
          <router-link class="nav-link" to="/diary">情绪日记</router-link>
        </template>
        <router-link class="nav-link" to="/knowledge">知识库</router-link>
        <template v-if="!userStore.isLogin">
          <router-link class="nav-link" :to="loginTo">登录</router-link>
          <router-link to="/auth/register">
            <el-button type="primary" size="small">注册</el-button>
          </router-link>
        </template>
        <template v-else>
          <el-button size="small" @click="handleLogout">退出登录</el-button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import logo from '@/assets/images/robot-fill.png'

const route = useRoute()
const userStore = useUserStore()

const loginTo = computed(() => {
  return { path: '/auth/login', query: { redirect: route.fullPath, mode: 'user' } }
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(`确认退出登录吗？`, '提示', { type: 'warning' })
    userStore.logout('/')
  } catch {
  }
}
</script>

<style scoped>
.user-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.header-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #303133;
}

.brand-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.nav-link {
  text-decoration: none;
  color: #606266;
  font-size: 14px;
}

.nav-link.router-link-active {
  color: #409eff;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  color: #606266;
}

.user-name {
  font-size: 14px;
}
</style>
