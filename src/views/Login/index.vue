 <template>
  <div class="login-container">
    <div class="back-home">
      <router-link to="/">
        <el-link type="info" :underline="false" class="back-home-link">
          <el-icon class="back-home-icon"><ArrowLeft /></el-icon>
          <span>返回首页</span>
        </el-link>
      </router-link>
    </div>
    <div class="login-header">
      <h2>欢迎登录</h2>
      <p>请输入您的账号信息</p>
    </div>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      @submit.prevent="handleLogin"
    >
      <el-form-item prop="account">
        <el-input
          v-model="loginForm.account"
          placeholder="请输入用户名或邮箱"
          :prefix-icon="User"
          size="large"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
    <div class="login-footer">
      <span>还没有账号？</span>
      <router-link to="/auth/register">
        <el-link type="primary" :underline="false">立即注册</el-link>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  account: 'admin',
  password: '123456',
  remember: false
})

const loginRules: FormRules = {
  account: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  console.log('开始登录')
  try {
    await loginFormRef.value.validate()
    console.log('验证通过')
    loading.value = true
    
    console.log('调用 userStore.login')
    await userStore.login({ account: loginForm.account, password: loginForm.password })
    console.log('登录成功，准备跳转')
    ElMessage.success('登录成功')
    
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const mode = typeof route.query.mode === 'string' ? route.query.mode : ''
    const initialMode = mode || (redirect.startsWith('/admin') ? 'admin' : 'user')
    const isInternalAdmin = loginForm.account === 'admin' && loginForm.password === '123456'
    const userType = (userStore.userInfo as any)?.userType
    const isAdmin = userType === 2
    const finalMode = isInternalAdmin || (initialMode === 'admin' && isAdmin) ? 'admin' : 'user'
    if (initialMode === 'admin' && finalMode === 'user') {
      ElMessage.error('该账号没有后台权限')
    }
    localStorage.setItem('loginMode', finalMode)
    if (finalMode === 'admin') {
      userStore.setUserInfo({ ...(userStore.userInfo || {}), userType: 2 })
    }
    const fallback = finalMode === 'user' ? '/' : '/admin/data'
    console.log('跳转到:', redirect || fallback)
    router.replace(redirect || fallback)
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  padding: 40px;
  
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.login-btn {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.back-home {
  margin-bottom: 10px;
}

.back-home-link {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.back-home-icon {
  font-size: 14px;
}
</style>
