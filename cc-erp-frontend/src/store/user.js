import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 检查是否为模拟模式
  const isMockMode = () => {
    return localStorage.getItem('mockMode') === 'true'
  }

  // 登录
  const login = async (loginForm) => {
    // 如果已经处于模拟模式，直接使用模拟登录
    if (isMockMode()) {
      const data = await loginApi(loginForm)
      token.value = data.token
      userInfo.value = {
        userId: data.userId,
        realName: data.realName
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      return data
    }

    // 正式模式 - 连接后端服务
    const data = await loginApi(loginForm)
    token.value = data.token
    userInfo.value = {
      userId: data.userId,
      realName: data.realName
    }
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return data
  }

  // 登出
  const logout = async () => {
    // 如果是模拟模式，不需要调用登出接口
    if (!isMockMode()) {
      try {
        await logoutApi()
      } catch (e) {
        console.warn('登出接口调用失败', e)
      }
    }
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('mockMode')
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
    restoreToken,
    isMockMode
  }
})
