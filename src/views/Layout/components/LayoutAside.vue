<template>
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <el-menu
      :default-active="1"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      router
      background-color="#fff"
      text-color="#304156"
      active-text-color="#409EFF"
    >
    <div class="brand">
      <!-- 使用导入的变量作为图片路径，记得加冒号 :src -->
      <el-image :src="logo" alt="logo" class="logo-img" />
      <div v-show="!isCollapse" class="info-card">
        <h1 class="brand-title">心理健康AI助手</h1>
        <p class="brand-desc">为您提供专业的心理健康支持</p>
      </div>
    </div>
      <el-menu-item @click="handleClick(item.path)" v-for="item in menuItems" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
    </el-aside>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { PieChart, ChatLineSquare, Message, User } from '@element-plus/icons-vue'
// 导入 Logo 图片
import logo from '@/assets/images/机器人.png'
const router = useRouter()
// 接收父组件传递的 isCollapse 状态
defineProps<{ isCollapse: boolean }>()

// 菜单项配置
const menuItems = [
  { index: '1', title: '数据分析', icon: markRaw(PieChart), path: '/data' },
  { index: '2', title: '知识管理', icon: markRaw(ChatLineSquare), path: '/Knowledge' },
  { index: '3', title: '咨询记录', icon: markRaw(Message), path: '/message' },
  { index: '4', title: '情绪日志', icon: markRaw(User), path: '/emotional' },
]

// 定义一个自定义事件，用于通知父组件切换状态
const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

const handleClick = (path: string) => {
  console.log(path)
  emit('toggle-collapse')
  router.push(path)
}
</script>

<style scoped>
.el-aside {
  transition: width 0.3s;
}
.brand {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
  height: 60px; /* 统一高度 */
  box-sizing: border-box;
  overflow: hidden;
}
.logo-img {
  width: 50px; /* 设置固定大小，不使用 100% */
  height: 50px; /* 设置固定大小，不使用 100% */
  flex-shrink: 0; /* 防止折叠时被挤压 */
  border-radius: 4px;
}
.info-card {
  margin-left: 10px;
  white-space: nowrap; /* 文本不换行 */
}
.brand-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}
.brand-desc {
  font-size: 10px;
  color: #888;
  margin: 0;
}

.el-menu {
  border-right: none;
  height: 100%; /* 确保菜单占满侧边栏高度 */
}
</style>



