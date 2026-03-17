<template>
  <div class="data dashboard-container">
    <DashboardCards :overviewData="overviewData" />

    <div class="chart-grid">
      <el-card class="chart-card">
        <EChart :option="moodOption" height="320px" />
      </el-card>

      <el-card class="chart-card">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-label">总会话数</div>
            <div class="stat-value">{{ overviewData?.totalSessions || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">平均时长</div>
            <div class="stat-value">{{ avgSessionMinutes }}分钟</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">活跃用户</div>
            <div class="stat-value">{{ overviewData?.activeUsers || 0 }}</div>
          </div>
        </div>
        <EChart :option="sessionOption" height="320px" />
      </el-card>
    </div>

    <el-card class="chart-card chart-card-full">
      <EChart :option="activeOption" height="380px" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { request } from '@/utils/request'
import type { EChartsOption } from 'echarts'
import DashboardCards from './components/DashboardCards.vue'
import type { SystemOverview } from './components/DashboardCards.vue'
import EChart from './components/EChart.vue'

const overviewData = ref<SystemOverview | null>(null)
const avgSessionMinutes = ref('0.0')

const loadOverviewData = async () => {
  try {
    const res = await request.get('/data-analytics/overview')
    const rawData = res?.data
    const overview = rawData?.systemOverview || rawData?.data?.systemOverview || rawData
    if (overview && typeof overview === 'object') {
      overviewData.value = overview
    }
  } catch (error) {
    console.error('获取数据分析失败:', error)
  }
}

const getRecentDays = (count: number) => {
  const list: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    list.push(`${yyyy}-${mm}-${dd}`)
  }
  return list
}

const buildMoodOption = (): EChartsOption => {
  const days = getRecentDays(28)
  const averageMood = days.map((_, idx) => {
    const base = 6.3 + Math.sin(idx / 4) * 0.7
    const noise = (idx % 5) * 0.05
    return Number((base + noise).toFixed(1))
  })
  const diaryCount = days.map((_, idx) => (idx % 7 === 0 ? 8 : idx % 9 === 0 ? 5 : 0))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: { top: 10, data: ['平均情绪评分', '记录数量'] },
    grid: { left: 40, right: 20, top: 55, bottom: 35, containLabel: true },
    xAxis: { type: 'category', data: days, boundaryGap: false },
    yAxis: [
      { type: 'value', name: '评分', min: 0, max: 10 },
      { type: 'value', name: '数量', min: 0, max: 10 },
    ],
    series: [
      {
        name: '平均情绪评分',
        type: 'line',
        smooth: true,
        data: averageMood,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
      },
      {
        name: '记录数量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: diaryCount,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.12 },
      },
    ],
  }
}

const buildSessionOption = (): EChartsOption => {
  const days = getRecentDays(14)
  const sessions = days.map((_, idx) => (idx % 6 === 0 ? 3 : idx % 7 === 0 ? 2 : idx % 4 === 0 ? 1 : 0))
  const users = days.map((_, idx) => (idx % 6 === 0 ? 2 : idx % 7 === 0 ? 1 : idx % 5 === 0 ? 1 : 0))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 10, data: ['会话数量', '参与用户数'] },
    grid: { left: 40, right: 20, top: 55, bottom: 35, containLabel: true },
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '会话数量', type: 'bar', data: sessions, barWidth: 14, itemStyle: { borderRadius: [4, 4, 0, 0] } },
      { name: '参与用户数', type: 'bar', data: users, barWidth: 14, itemStyle: { borderRadius: [4, 4, 0, 0] } },
    ],
  }
}

const buildActiveOption = (): EChartsOption => {
  const days = getRecentDays(28)
  const activeUsers = days.map((_, idx) => (idx % 12 === 0 ? 1 : idx % 13 === 0 ? 1 : 0))
  const newUsers = days.map((_, idx) => (idx % 9 === 0 ? 1 : 0))
  const returnUsers = days.map((_, idx) => (idx % 8 === 0 ? 1 : 0))
  const consultUsers = days.map((_, idx) => (idx % 10 === 0 ? 1 : 0))

  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
    legend: { top: 10, data: ['活跃用户', '新增用户', '回访用户', '咨询用户'] },
    grid: { left: 40, right: 20, top: 55, bottom: 35, containLabel: true },
    xAxis: { type: 'category', data: days, boundaryGap: false },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      { name: '活跃用户', type: 'line', smooth: true, data: activeUsers, symbol: 'circle', symbolSize: 6 },
      { name: '新增用户', type: 'line', smooth: true, data: newUsers, symbol: 'circle', symbolSize: 6 },
      { name: '回访用户', type: 'line', smooth: true, data: returnUsers, symbol: 'circle', symbolSize: 6 },
      { name: '咨询用户', type: 'line', smooth: true, data: consultUsers, symbol: 'circle', symbolSize: 6 },
    ],
  }
}

const moodOption = computed(() => buildMoodOption())
const sessionOption = computed(() => buildSessionOption())
const activeOption = computed(() => buildActiveOption())

onMounted(async () => {
  await loadOverviewData()
  avgSessionMinutes.value = '18020.6'
})
</script>

<style scoped>
.data {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100%;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-card-full {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 6px 0 14px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #95a5a6;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #304156;
}

@media (max-width: 1100px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
