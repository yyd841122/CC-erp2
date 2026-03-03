<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1 class="title">CC ERP</h1>
        <p class="subtitle">企业管理系统</p>
        <el-tag v-if="isMockMode" type="warning" size="small" style="margin-top: 8px">
          模拟数据模式
        </el-tag>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="mockModeEnabled" @change="handleMockModeChange">
            使用模拟数据模式（无需后端）
          </el-checkbox>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>默认账号: admin / admin123</p>
        <p class="copyright">© 2024 CC ERP. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)
const mockModeEnabled = ref(false)

// 检查是否为模拟模式
const isMockMode = computed(() => {
  return localStorage.getItem('mockMode') === 'true'
})

// 初始化时检查模拟模式
onMounted(() => {
  mockModeEnabled.value = isMockMode.value
})

// 处理模拟模式切换
const handleMockModeChange = (checked) => {
  if (checked) {
    localStorage.setItem('mockMode', 'true')
    ElMessage.info('已启用模拟数据模式')
  } else {
    localStorage.removeItem('mockMode')
    ElMessage.info('已关闭模拟数据模式')
  }
}

const loginForm = reactive({
  username: 'admin',
  password: 'admin123'
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.login(loginForm)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    // 如果是网络错误且未启用模拟模式，提示用户
    if (!mockModeEnabled.value && error.message?.includes('模拟登录')) {
      ElMessage.warning('请勾选"使用模拟数据模式"后再试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890FF 0%, #0050B3 100%);
}

.login-box {
  width: 400px;
  padding: 48px 40px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .title {
    font-size: 32px;
    font-weight: 600;
    color: #1890FF;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
    color: #8C8C8C;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  .el-checkbox {
    width: 100%;
  }
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  color: #8C8C8C;
  font-size: 12px;

  p {
    margin: 4px 0;
  }

  .copyright {
    margin-top: 16px;
  }
}
</style>
