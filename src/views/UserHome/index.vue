<template>
  <div class="home">
    <div class="hero">
      <div class="container hero-inner">
        <div class="left">
          <div class="headline">
            <div class="line1">一次温暖的对话</div>
            <div class="line2">化孤独为慰藉</div>
          </div>
          <div class="desc">
            每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连接温暖你的每一天
          </div>
          <div class="actions">
            <el-button type="primary" class="btn" @click="startChat">开始对话，获得陪伴</el-button>
            <el-button class="btn ghost" @click="startMood">记录心情，释放情绪</el-button>
          </div>
        </div>
        <div class="right">
          <div class="robot-circle">
            <img class="robot" :src="robot" alt="robot" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import robot from '@/assets/images/robot-fill.png'

const router = useRouter()
const userStore = useUserStore()

const requireLogin = (redirect: string) => {
  if (userStore.isLogin) return true
  router.push({ path: '/auth/login', query: { redirect, mode: 'user' } })
  return false
}

const startChat = () => {
  if (!requireLogin('/consult')) return
  router.push('/consult')
}

const startMood = () => {
  if (!requireLogin('/diary')) return
  router.push('/diary')
}
</script>

<style scoped>
.hero {
  height: calc(100vh - 64px - 56px);
  min-height: 320px;
  background: linear-gradient(135deg, #5f9c93 0%, #4a8f86 100%);
  display: flex;
  align-items: center;
}

.container {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0 24px;
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
}

.left {
  max-width: 560px;
}

.headline .line1 {
  font-size: 36px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
}

.headline .line2 {
  margin-top: 6px;
  font-size: 36px;
  font-weight: 800;
  color: #f7d23e;
  letter-spacing: 1px;
}

.desc {
  margin-top: 18px;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  line-height: 1.8;
}

.actions {
  margin-top: 22px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 6px;
}

.ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  border-color: rgba(255, 255, 255, 0.65);
}

.ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.85);
}

.right {
  display: flex;
  justify-content: flex-start;
  flex: none;
}

.robot-circle {
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.robot {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

@media (max-width: 900px) {
  .hero-inner {
    flex-direction: column;
  }
  .right {
    margin-top: 18px;
  }
}
</style>
