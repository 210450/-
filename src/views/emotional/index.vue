<template>
  <div class="emotional">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-row">
        <div class="search-item">
          <label>用户ID</label>
          <el-input v-model="searchParams.userId" placeholder="请输入用户ID" />
        </div>
        <div class="search-item">
          <label>情绪评分</label>
          <el-select v-model="searchParams.moodScoreRange" placeholder="选择评分范围">
            <el-option label="全部" value="" />
            <el-option label="1-3分" value="1-3" />
            <el-option label="4-6分" value="4-6" />
            <el-option label="7-10分" value="7-10" />
          </el-select>
        </div>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>
    
    <!-- 情绪日记列表 -->
    <div class="emotional-list">
      <el-table :data="emotionalList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="会话ID" width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="30" :src="getAvatarUrl(scope.row.userId)">
                {{ getAvatarText(scope.row.username || scope.row.userId) }}
              </el-avatar>
              <span class="user-name">{{ scope.row.username || scope.row.userId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="记录日期" width="150">
          <template #default="scope">
            {{ scope.row.diaryDate || scope.row.recordDate }}
          </template>
        </el-table-column>
        <el-table-column label="情绪评分" width="250">
          <template #default="scope">
            <div class="star-rating">
              <span 
                v-for="i in 10" 
                :key="i"
                :class="['star', i <= (scope.row.moodScore || 0) ? 'active' : '']"
              >★</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="生活指标" width="150">
          <template #default="scope">
            <div class="life-indicators">
              <div>睡眠: {{ scope.row.sleepQuality || 3 }}/5</div>
              <div>压力: {{ scope.row.stressLevel || 3 }}/5</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="情绪触发因素" width="150">
          <template #default="scope">
            {{ scope.row.emotionTriggers || scope.row.emotionTrigger }}
          </template>
        </el-table-column>
        <el-table-column label="日记内容" min-width="200">
          <template #default="scope">
            {{ scope.row.diaryContent || scope.row.content }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button type="text" class="detail-btn" @click="handleView(scope.row)">详情</el-button>
            <el-button type="text" class="delete-btn" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="loadEmotionalList"
        />
      </div>
    </div>
    
    <!-- 情绪日记详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="情绪日记详情"
      width="600px"
      :close-on-click-modal="false"
      custom-class="diary-dialog"
    >
      <div v-if="selectedDiary" class="diary-detail">
        <!-- 用户信息 -->
        <div class="section">
          <h3>用户信息</h3>
          <div class="info-table">
            <div class="info-row">
              <div class="info-cell">
                <span class="label">用户名</span>
                <span class="value">{{ selectedDiary.username || selectedDiary.userId }}</span>
              </div>
              <div class="info-cell">
                <span class="label">昵称</span>
                <span class="value">{{ selectedDiary.username || selectedDiary.userId }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-cell">
                <span class="label">用户ID</span>
                <span class="value">{{ selectedDiary.userId }}</span>
              </div>
              <div class="info-cell">
                <span class="label">记录日期</span>
                <span class="value">{{ selectedDiary.diaryDate || selectedDiary.recordDate }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 情绪状态 -->
        <div class="section">
          <h3>情绪状态</h3>
          <div class="info-table">
            <div class="info-row">
              <div class="info-cell">
                <span class="label">情绪评分</span>
                <div class="star-rating detail-star">
                  <span 
                    v-for="i in 10" 
                    :key="i"
                    :class="['star', i <= (selectedDiary.moodScore || 0) ? 'active' : '']"
                  >★</span>
                  <span class="score-text">{{ selectedDiary.moodScore || 0 }}</span>
                </div>
              </div>
              <div class="info-cell">
                <span class="label">主要情绪</span>
                <span class="value">{{ selectedDiary.dominantEmotion || '未知' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-cell">
                <span class="label">睡眠质量</span>
                <span class="value">{{ selectedDiary.sleepQuality || 3 }}/5</span>
              </div>
              <div class="info-cell">
                <span class="label">压力水平</span>
                <span class="value">{{ selectedDiary.stressLevel || 3 }}/5</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 日记内容 -->
        <div class="section">
          <h3>日记内容</h3>
          <div class="info-table">
            <div class="info-row">
              <div class="info-cell full-width">
                <span class="label">情绪触发因素</span>
                <span class="value">{{ selectedDiary.emotionTriggers || selectedDiary.emotionTrigger || '无' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-cell full-width">
                <span class="label">日记内容</span>
                <span class="value">{{ selectedDiary.diaryContent || selectedDiary.content || '无' }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI情绪分析结果 -->
        <div class="section">
          <h3>AI情绪分析结果</h3>
          <div v-if="aiAnalysis" class="info-table">
            <div class="info-row">
              <div class="info-cell">
                <span class="label">主要情绪</span>
                <span class="value">{{ aiAnalysis.primaryEmotion || aiAnalysis.label || '未知' }}</span>
              </div>
              <div class="info-cell">
                <span class="label">情绪强度</span>
                <div class="emotion-strength">
                  <div class="strength-bar">
                    <div class="strength-fill" :style="{ width: (aiAnalysis.emotionScore || 50) + '%' }"></div>
                  </div>
                  <span class="strength-text">{{ aiAnalysis.emotionScore || 50 }}%</span>
                </div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-cell">
                <span class="label">风险等级</span>
                <span class="value risk-level" :class="getRiskLevelClass(aiAnalysis.riskLevel || 0)">
                  {{ getRiskLevelText(aiAnalysis.riskLevel || 0) }}
                </span>
              </div>
              <div class="info-cell">
                <span class="label">情绪性质</span>
                <span class="value emotion-nature" :class="getEmotionNatureClass(aiAnalysis.isNegative || false)">
                  {{ getEmotionNatureText(aiAnalysis.isNegative || false) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="analysis-details">
            <div class="detail-item">
              <h4>专业建议</h4>
              <p>{{ aiAnalysis?.suggestion || aiAnalysis?.improvementSuggestions?.join('、') || '暂无建议' }}</p>
            </div>
            <div class="detail-item">
              <h4>风险描述</h4>
              <p>{{ aiAnalysis?.riskDescription || '暂无描述' }}</p>
            </div>
            <div class="detail-item">
              <h4>改善建议</h4>
              <p>{{ aiAnalysis?.improvementSuggestions?.join('、') || '暂无建议' }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="loading">加载中...</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { request } from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'

// 定义类型接口
interface EmotionDiary {
  id: number | string
  userId: number | string
  username?: string
  diaryDate?: string
  recordDate?: string
  moodScore?: number
  dominantEmotion?: string
  sleepQuality?: number
  stressLevel?: number
  emotionTriggers?: string
  emotionTrigger?: string
  diaryContent?: string
  content?: string
  aiEmotionAnalysis?: string | AIAnalysis
}

interface AIAnalysis {
  primaryEmotion?: string
  label?: string
  emotionScore?: number
  isNegative?: boolean
  riskLevel?: number
  suggestion?: string
  riskDescription?: string
  improvementSuggestions?: string[]
}

const emotionalList = ref<EmotionDiary[]>([])
const pagination = ref({ currentPage: 1, total: 0 })
const searchParams = ref({
  userId: '',
  moodScoreRange: ''
})
const detailDialogVisible = ref(false)
const selectedDiary = ref<EmotionDiary | null>(null)
const aiAnalysis = ref<AIAnalysis | null>(null)

const loadEmotionalList = async () => {
  try {
    const params = {
      currentPage: pagination.value.currentPage.toString(),
      size: '10',
      ...searchParams.value
    }
    
    const res = await request.get('/emotion-diary/admin/page', params)
    
    if (res.code === 200 || res.code === '200' || res.success) {
      emotionalList.value = Array.isArray(res.data?.records) ? res.data.records : []
      pagination.value.total = res.data?.total || 0
    }
  } catch (error: any) {
    console.error('获取情绪日记失败:', error)
  }
}

const getAvatarUrl = (userId: string | number) => {
  return `https://ui-avatars.com/api/?name=${userId}&background=random&color=fff&size=30`
}

const getAvatarText = (name: string | number) => {
  const str = String(name)
  return str.charAt(0).toUpperCase()
}

const handleSearch = () => {
  pagination.value.currentPage = 1
  loadEmotionalList()
}

const handleReset = () => {
  searchParams.value = {
    userId: '',
    moodScoreRange: ''
  }
  pagination.value.currentPage = 1
  loadEmotionalList()
}

const handleView = (row: any) => {
  selectedDiary.value = row
  // 解析 AI 情绪分析数据
  if (row.aiEmotionAnalysis) {
    try {
      aiAnalysis.value = typeof row.aiEmotionAnalysis === 'string' 
        ? JSON.parse(row.aiEmotionAnalysis) 
        : row.aiEmotionAnalysis
    } catch (error) {
      console.error('解析 AI 情绪分析数据失败:', error)
      aiAnalysis.value = null
    }
  } else {
    aiAnalysis.value = null
  }
  detailDialogVisible.value = true
}

const handleDelete = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇情绪日记吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用删除 API
    const res = await request.delete(`/emotion-diary/admin/${id}`)
    
    // 检查删除结果
    if (res.code === 200 || res.code === '200' || res.success) {
      ElMessage.success('删除成功')
      await loadEmotionalList()
    } else {
      ElMessage.error(res.message || res.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除情绪日记失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const getRiskLevelClass = (level: number) => {
  if (level === 0) return 'risk-normal'
  if (level === 1) return 'risk-low'
  if (level === 2) return 'risk-medium'
  return 'risk-high'
}

const getRiskLevelText = (level: number) => {
  const levelMap: Record<number, string> = {
    0: '正常',
    1: '低风险',
    2: '中风险',
    3: '高风险'
  }
  return levelMap[level] || '未知'
}

const getEmotionNatureClass = (isNegative: boolean) => {
  return isNegative ? 'emotion-negative' : 'emotion-positive'
}

const getEmotionNatureText = (isNegative: boolean) => {
  return isNegative ? '负面情绪' : '正面情绪'
}

onMounted(loadEmotionalList)
</script>

<style scoped>
.emotional {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100%;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.search-item .el-input,
.search-item .el-select {
  width: 200px;
}

.search-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.emotional-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #304156;
}

.star-rating {
  display: flex;
  align-items: center;
}

.star {
  font-size: 16px;
  color: #dcdfe6;
  margin-right: 2px;
}

.star.active {
  color: #f56c6c;
}

.life-indicators {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.detail-btn {
  color: #409eff;
}

.delete-btn {
  color: #f56c6c;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
}

/* 详情弹窗样式 */
.diary-dialog {
  border-radius: 8px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.diary-detail {
  padding: 10px 0;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: bold;
  color: #304156;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-cell {
  flex: 1;
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
}

.info-cell:first-child {
  padding-left: 0;
  padding-right: 20px;
}

.info-cell.full-width {
  flex: 1 1 100%;
}

.info-cell .label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.info-cell .value {
  font-size: 14px;
  color: #304156;
  font-weight: 500;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.score-text {
  margin-left: 8px;
  font-size: 14px;
  color: #304156;
}

.detail-star {
  flex: 1;
  min-width: 200px;
}

.emotion-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin-left: 16px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  background-color: #409eff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.strength-text {
  font-size: 12px;
  color: #606266;
  min-width: 40px;
  text-align: right;
}

.risk-level.risk-normal {
  color: #67c23a;
  background-color: #f0f9eb;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.risk-level.risk-low {
  color: #e6a23c;
  background-color: #fdf6ec;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.risk-level.risk-medium {
  color: #f56c6c;
  background-color: #fef0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.risk-level.risk-high {
  color: #f56c6c;
  background-color: #fef0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.emotion-nature.emotion-positive {
  color: #67c23a;
  background-color: #f0f9eb;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.emotion-nature.emotion-negative {
  color: #f56c6c;
  background-color: #fef0f0;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.analysis-details {
  margin-top: 16px;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #304156;
}

.detail-item p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  white-space: pre-wrap;
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.loading {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>
