<template>
  <el-header>
    <div class="header-inner">
      <div class="header-content">
        <el-button type="primary" @click="toggleCollapse" :icon="isCollapse ? Expand : Fold" class="collapse-btn" text />
        <span>{{ title }}</span>
      </div>
      <div class="header-actions">
        <el-dropdown @command="handleCommand">
          <span class="user-trigger">
            <el-icon class="user-icon"><UserFilled /></el-icon>
            <span class="user-name">{{ displayName }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="!isLogin" command="login">登录</el-dropdown-item>
              <el-dropdown-item command="register">注册账号</el-dropdown-item>
              <el-dropdown-item v-if="isLogin" command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Fold, Expand, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

defineProps<{ isCollapse: boolean }>()

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const title = computed(() => {
  return (route.meta.title as string) || '心理健康 AI 助手'
})

const isLogin = computed(() => userStore.isLogin)

const displayName = computed(() => {
  if (!userStore.isLogin) return '未登录'
  return userStore.userInfo?.username || userStore.userInfo?.nickname || userStore.userInfo?.email || '用户'
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    return
  }
  if (command === 'login') {
    router.push('/auth/login')
    return
  }
  if (command === 'register') {
    router.push('/auth/register')
  }
}
</script>

<style scoped>
.el-header {
  height: 60px; /* 统一高度 */
  background-color: #fff;
  color: #333;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  color: #606266;
}

.user-icon {
  font-size: 18px;
}

.user-name {
  font-size: 14px;
}

.arrow-icon {
  font-size: 12px;
}

.collapse-btn {
  font-size: 24px;
  margin-right: 15px;
  height: auto;
  padding: 0 5px;
}
</style>
