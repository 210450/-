<template>
  <div class="diary">
    <div class="container">
      <el-card class="card">
        <div class="header">
          <div class="title">情绪日记</div>
          <el-button type="primary" @click="openCreate">新增日记</el-button>
        </div>

        <div class="empty">
          <div class="empty-title">暂无记录</div>
          <div class="empty-desc">开始记录你的心情变化，AI 会给出温柔建议</div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" title="新增情绪日记" width="560px" :close-on-click-modal="false">
      <el-form :model="form" label-width="90px">
        <el-form-item label="情绪评分">
          <el-rate v-model="form.score" :max="10" />
        </el-form-item>
        <el-form-item label="触发因素">
          <el-input v-model="form.trigger" placeholder="是什么引发了这种情绪？" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="5" placeholder="写下今天的感受…" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const form = reactive({
  score: 7,
  trigger: '',
  content: '',
})

const openCreate = () => {
  dialogVisible.value = true
}

const save = () => {
  dialogVisible.value = false
  ElMessage.success('已保存（示例页面，后续可接入接口）')
}
</script>

<style scoped>
.diary {
  padding: 24px 0 40px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 56px);
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.empty {
  padding: 40px 0 30px;
  text-align: center;
  color: #909399;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #606266;
}

.empty-desc {
  margin-top: 8px;
  font-size: 13px;
}
</style>
