<template>
  <el-header>
    <div class="header-content">
      <el-button @click="toggleCollapse" :icon="isCollapse ? Expand : Fold" class="collapse-btn" text />
      <span>{{ title }}</span>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()

defineProps<{ isCollapse: boolean }>()

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

const toggleCollapse = () => {
  emit('toggle-collapse')
}

const title = computed(() => {
  return route.meta.title || '心理健康 AI 助手'
})
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

.header-content {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 24px;
  margin-right: 15px;
  height: auto;
  padding: 0 5px;
}
</style>
