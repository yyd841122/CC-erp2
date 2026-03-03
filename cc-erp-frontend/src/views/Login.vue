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

      <!-- 系统未初始化提示 -->
      <el-alert
        v-if="!hasUsers"
        title="系统尚未初始化"
        type="info"
        description="请先创建系统管理员账号"
        :closable="false"
        style="margin-bottom: 16px;"
      />

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
            :disabled="!hasUsers"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : (hasUsers ? '登录' : '请先初始化系统') }}
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="mockModeEnabled" @change="handleMockModeChange">
            使用模拟数据模式（无需后端）
          </el-checkbox>
        </el-form-item>

        <el-form-item v-if="!hasUsers">
          <el-button
            type="success"
            size="large"
            class="login-button"
            @click="showInitDialog = true"
          >
            初始化系统
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p class="copyright">© 2024 CC ERP. All rights reserved.</p>
      </div>
    </div>

    <!-- 系统初始化对话框 -->
    <el-dialog
      v-model="showInitDialog"
      title="初始化系统 - 创建管理员"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="initFormRef"
        :model="initForm"
        :rules="initRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="initForm.username" placeholder="请输入管理员用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="initForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="initForm.password" type="password" show-password placeholder="请输入密码（至少6位）" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="initForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="initForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="initForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInitDialog = false">取消</el-button>
        <el-button type="primary" :loading="initSubmitting" @click="handleInitialize">
          创建管理员
        </el-button>
      </template>
    </el-dialog>
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
const initFormRef = ref()
const loading = ref(false)
const initSubmitting = ref(false)
const mockModeEnabled = ref(false)
const showInitDialog = ref(false)
const hasUsers = ref(true)

// 检查是否为模拟模式
const isMockMode = computed(() => {
  return localStorage.getItem('mockMode') === 'true'
})

// 检查系统是否有用户
const checkHasUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('cc_erp_test_users') || '[]')
    hasUsers.value = users.length > 0
  } catch (e) {
    hasUsers.value = false
  }
}

// 初始化时检查模拟模式和用户状态
onMounted(() => {
  mockModeEnabled.value = isMockMode.value
  checkHasUsers()
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
  checkHasUsers()
}

const loginForm = reactive({
  username: '',
  password: ''
})

// 系统初始化表单
const initForm = reactive({
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
})

// 确认密码验证
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== initForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const initRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 初始化系统
const handleInitialize = async () => {
  try {
    await initFormRef.value.validate()
    initSubmitting.value = true

    // 创建默认管理员角色
    const defaultRole = {
      id: Date.now(),
      roleCode: 'ADMIN',
      roleName: '系统管理员',
      description: '拥有所有权限',
      permissions: ['*'],
      isEnabled: true,
      createdAt: new Date().toLocaleString('zh-CN')
    }

    // 创建管理员用户
    const adminUser = {
      id: Date.now() + 1,
      username: initForm.username,
      password: initForm.password, // 实际系统应该加密存储
      realName: initForm.realName,
      email: initForm.email || '',
      phone: initForm.phone || '',
      isEnabled: true,
      roles: [{ id: defaultRole.id, roleCode: 'ADMIN', roleName: '系统管理员' }],
      lastLoginTime: null,
      createdAt: new Date().toLocaleString('zh-CN')
    }

    // 保存到 localStorage
    const roles = [defaultRole]
    const users = [adminUser]

    localStorage.setItem('cc_erp_test_roles', JSON.stringify(roles))
    localStorage.setItem('cc_erp_test_users', JSON.stringify(users))

    ElMessage.success('系统初始化成功，请登录')
    showInitDialog.value = false
    checkHasUsers()

    // 自动填充登录表单
    loginForm.username = adminUser.username
    loginForm.password = adminUser.password

    // 重置初始化表单
    Object.assign(initForm, {
      username: '',
      realName: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: ''
    })
  } catch (error) {
    console.error('初始化失败:', error)
  } finally {
    initSubmitting.value = false
  }
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
