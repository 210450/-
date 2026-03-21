<template>
  <div class="register-container">
    <div class="register-header">
      <h2>注册账号</h2>
      <p>创建一个新的用户账户</p>
    </div>
    <el-form ref="formRef" :model="form" :rules="rules" class="register-form" @submit.prevent="handleRegister">
      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
      </el-form-item>
      <el-form-item prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" :prefix-icon="Message" size="large" />
      </el-form-item>
      <el-form-item prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称（可选）" :prefix-icon="User" size="large" />
      </el-form-item>
      <el-form-item prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号（可选）" :prefix-icon="Phone" size="large" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" size="large" show-password />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          :prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>
      <el-form-item prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" class="submit-btn" :loading="submitLoading" @click="handleRegister">
          注册
        </el-button>
      </el-form-item>
    </el-form>
    <div class="register-footer">
      <span>已有账号？</span>
      <router-link to="/auth/login"><el-link type="primary" :underline="false">去登录</el-link></router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

const form = reactive({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 1,
  userType: 1,
})

const validateConfirmPassword = (_: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请再次输入密码'))
  if (value !== form.password) return callback(new Error('两次输入的密码不一致'))
  return callback()
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
}

const handleRegister = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload = {
      username: form.username,
      email: form.email,
      nickname: form.nickname || undefined,
      phone: form.phone || undefined,
      password: form.password,
      confirmPassword: form.confirmPassword,
      gender: form.gender,
      userType: form.userType,
    }
    const fn = (userStore as any).register
    if (typeof fn === 'function') {
      await fn(payload)
    } else {
      await authApi.register(payload)
    }
    ElMessage.success('注册成功，请登录')
    router.push('/auth/login')
  } catch (error: any) {
    ElMessage.error(error?.message || '注册失败')
  } finally {
    submitLoading.value = false
  }
}
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
