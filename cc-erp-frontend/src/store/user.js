import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 登录
  const login = async (loginForm) => {
    try {
      const data = await loginApi(loginForm)
      token.value = data.token
      userInfo.value = {
        userId: data.userId,
        realName: data.realName
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      return data
    } catch (error) {
      ElMessage.error('登录失败: ' + (error.message || '请检查网络连接'))
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      console.warn('登出接口调用失败', e)
    }
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('mockMode')
    localStorage.removeItem('cc_erp_user_permissions')
  }

  // 恢复登录状态
  const restoreToken = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedToken) {
      token.value = savedToken
    }
    if (savedUserInfo) {
      userInfo.value = JSON.parse(savedUserInfo)
    }
  }

  return {
    token,
    userInfo,
    login,
    logout,
    restoreToken
  }
})
