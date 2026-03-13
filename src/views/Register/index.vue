<template>
  <div class="register-container">
    <div class="register-header">
      <h2>验证码验证</h2>
      <p>用于登录/注册前的验证码校验</p>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" class="register-form" @submit.prevent="handleVerify">
      <el-form-item prop="account">
        <el-input v-model="form.account" placeholder="请输入手机号或邮箱" :prefix-icon="User" size="large" />
      </el-form-item>
      <el-form-item prop="code">
        <div class="code-row">
          <el-input v-model="form.code" placeholder="请输入验证码" :prefix-icon="Key" size="large" />
          <el-button class="code-btn" :disabled="countdown > 0" :loading="codeLoading" @click="handleGetCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="submitLoading" @click="handleVerify">
          验证
        </el-button>
      </el-form-item>
    </el-form>
    <div class="register-footer">
      <router-link to="/auth/login">
        <el-link type="primary" :underline="false">返回登录</el-link>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Key } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const codeLoading = ref(false)
const submitLoading = ref(false)
const countdown = ref(0)
let timer: number | undefined

const form = reactive({
  account: '',
  code: '',
})

const rules: FormRules = {
  account: [{ required: true, message: '请输入手机号或邮箱', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const startCountdown = (seconds: number) => {
  countdown.value = seconds
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      countdown.value = 0
      if (timer) window.clearInterval(timer)
      timer = undefined
    }
  }, 1000)
}

const handleGetCode = async () => {
  if (!formRef.value) return
  const ok = await formRef.value.validateField('account').catch(() => false)
  if (!ok) return

  codeLoading.value = true
  try {
    await userStore.getCode({ account: form.account })
    ElMessage.success('验证码已发送')
    startCountdown(60)
  } finally {
    codeLoading.value = false
  }
}

const handleVerify = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    await userStore.authentication({ account: form.account, code: form.code })
    ElMessage.success('验证码校验通过')
    router.push('/auth/login')
  } finally {
    submitLoading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.register-container {
  width: 100%;
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 14px;
  color: #909399;
}

.register-form {
  width: 100%;
}

.code-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-btn {
  width: 120px;
  flex: none;
}

.submit-btn {
  width: 100%;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}
</style>
