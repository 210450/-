<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏组件 -->
      <LayoutAside :isCollapse="isCollapse" />

      <el-container class="is-vertical">
        <!-- 头部组件 -->
        <LayoutHeader @toggle-collapse="toggleCollapse" :isCollapse="isCollapse" />
        <el-main>
          <!-- 这里渲染子路由组件 -->
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutAside from './components/LayoutAside.vue'
import LayoutHeader from './components/LayoutHeader.vue'

const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.common-layout,
.el-container {
  height: 100%;
}

.is-vertical {
  flex: 1; /* 让右侧容器占据剩余全部宽度 */
  flex-direction: column; /* 确保 Header 和 Main 垂直排列 */
}

.el-main {
  
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto; /* 关键：让 Main 区域可以滚动 */
}


</style>
