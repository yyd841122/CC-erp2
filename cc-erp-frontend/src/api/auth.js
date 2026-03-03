import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// 从 localStorage 获取用户列表
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('cc_erp_test_users') || '[]')
  } catch (e) {
    console.error('读取用户数据失败:', e)
    return []
  }
}

// 模拟登录数据（从 localStorage 读取真实用户）
const mockLogin = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers()
      const user = users.find(u => u.username === data.username && u.password === data.password)

      if (user) {
        resolve({
          token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI' + user.id + '9.test',
          userId: user.id,
          realName: user.realName || user.username
        })
      } else {
        // 没有找到匹配的用户
        if (users.length === 0) {
          reject(new Error('系统暂无用户，请先在系统管理中添加用户'))
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }
    }, 300)
  })
}

// 登录
export const login = (data) => {
  // 模拟模式直接返回模拟数据，不经过代理
  if (isMockMode()) {
    console.log('[模拟模式] 登录请求', data)
    return mockLogin(data)
  }
  return request({
    url: '/v1/auth/login',
    method: 'post',
    data
  })
}

// 登出
export const logout = () => {
  if (isMockMode()) {
    console.log('[模拟模式] 登出请求')
    return Promise.resolve()
  }
  return request({
    url: '/v1/auth/logout',
    method: 'post'
  })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  if (isMockMode()) {
    // 从 localStorage 读取当前登录用户的信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (userInfo.userId) {
      const users = getUsers()
      const user = users.find(u => u.id === userInfo.userId)
      if (user) {
        return Promise.resolve({
          userId: user.id,
          username: user.username,
          realName: user.realName || user.username,
          roles: user.roles || []
        })
      }
    }
    // 如果没有找到用户，返回基本信息
    return Promise.resolve({
      userId: userInfo.userId || 0,
      username: userInfo.username || '',
      realName: userInfo.realName || '未知用户',
      roles: []
    })
  }
  return request({
    url: '/v1/auth/me',
    method: 'get'
  })
}
