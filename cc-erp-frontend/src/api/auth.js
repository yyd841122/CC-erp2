import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// 模拟登录数据
const mockLogin = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.username === 'admin' && data.password === 'admin123') {
        resolve({
          token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzA5NDkxMjAwLCJleHAiOjk5OTk5OTk5OTl9.test',
          userId: 1,
          realName: '管理员'
        })
      } else {
        throw new Error('用户名或密码错误')
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
    return Promise.resolve({
      userId: 1,
      username: 'admin',
      realName: '管理员',
      roles: ['ADMIN']
    })
  }
  return request({
    url: '/v1/auth/me',
    method: 'get'
  })
}
