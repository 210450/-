<template>
  <div class="data-cards">
    <el-card class="data-card">
      <div class="card-content">
        <div class="avatar users">
          <img src="@/assets/images/users.png" alt="总用户数" />
        </div>
        <div class="info">
          <div class="title">总用户数</div>
          <div class="value">{{ overviewData?.totalUsers || 0 }}</div>
          <div class="subtitle-title">活跃用户: {{ overviewData?.activeUsers || 0 }} | 今日新增: {{ overviewData?.todayNewUsers || 0 }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="data-card">
      <div class="card-content">
        <div class="avatar like">
          <img src="@/assets/images/like.png" alt="情绪日志" />
        </div>
        <div class="info">
          <div class="title">情绪日志</div>
          <div class="value">{{ overviewData?.totalDiaries || 0 }}</div>
          <div class="subtitle-title">今日新增: {{ overviewData?.todayNewDiaries || 0 }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="data-card">
      <div class="card-content">
        <div class="avatar comments">
          <img src="@/assets/images/comments.png" alt="咨询会话" />
        </div>
        <div class="info">
          <div class="title">咨询会话</div>
          <div class="value">{{ overviewData?.totalSessions || 0 }}</div>
          <div class="subtitle-title">今日新增: {{ overviewData?.todayNewSessions || 0 }}</div>
        </div>
      </div>
    </el-card>

    <el-card class="data-card">
      <div class="card-content">
        <div class="avatar smile">
          <img src="@/assets/images/smile.png" alt="平均情绪" />
        </div>
        <div class="info">
          <div class="title">平均情绪</div>
          <div class="value">{{ overviewData?.avgMoodScore || 0 }}/10</div>
          <div class="subtitle-title">情绪健康指数</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
export type SystemOverview = {
  totalUsers: number
  activeUsers: number
  totalDiaries: number
  totalSessions: number
  avgMoodScore: number
  todayNewDiaries: number
  todayNewSessions: number
  todayNewUsers: number
}

defineProps<{
  overviewData: SystemOverview | null
}>()
</script>

<style scoped>
.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.data-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.avatar {
  margin-right: 12px;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar.like {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.avatar.comments {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.avatar.smile {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.avatar img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.info {
  flex: 1;
}

.info .title {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
  font-weight: normal;
}

.info .value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.info .subtitle-title {
  font-size: 12px;
  color: #95a5a6;
}
</style>
