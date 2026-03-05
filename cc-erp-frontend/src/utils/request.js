import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import {
  ErrorCodes,
  getErrorMessage
} from './error'

/**
 * 是否为模拟模式
 */
function isMockMode() {
  return localStorage.getItem('mockMode') === 'true'
}

/**
 * 模拟数据（已清空虚拟数据，使用各模块API的localStorage机制）
 */
const mockData = {}

/**
 * 请求状态管理（防止重复请求）
 */
const pendingRequests = new Map()

/**
 * 生成请求唯一键
 */
function generateRequestKey(config) {
  const { method, url } = config
  const params = config.params ? JSON.stringify(config.params) : ''
  const data = config.data ? JSON.stringify(config.data) : ''
  return [method, url, params, data].join(':')
}

/**
 * 处理模拟模式响应
 */
function handleMockResponse(error) {
  const url = error.config?.url
  if (mockData[url]) {
    console.log(`[模拟模式] ${url}`, mockData[url])
    return Promise.resolve(mockData[url])
  }
  console.log(`[模拟模式] ${url} -> 返回空数据`)
  return Promise.resolve({ code: 200, data: [], msg: 'success' })
}

/**
 * 处理业务错误
 */
function handleBusinessError(code, message) {
  const msg = getErrorMessage(code, message)

  switch (code) {
    case ErrorCodes.UNAUTHORIZED:
      ElMessageBox.alert('登录已过期，请重新登录', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
        showClose: false
      }).then(() => {
        const userStore = useUserStore()
        userStore.logout()
        window.location.href = '/login'
      })
      break

    case ErrorCodes.FORBIDDEN:
      ElMessage.error(msg)
      break

    case ErrorCodes.VALIDATION_ERROR:
      ElMessage.warning(msg)
      break

    default:
      ElMessage.error(msg)
  }

  return Promise.reject(new Error(message))
}

/**
 * 处理HTTP错误
 */
function handleHttpError(error) {
  let message = '请求失败'

  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 400:
        message = data?.message || data?.msg || '请求参数错误'
        break
      case 401:
        return handleBusinessError(ErrorCodes.UNAUTHORIZED, '登录已过期')
      case 403:
        return handleBusinessError(ErrorCodes.FORBIDDEN, '没有权限访问')
      case 404:
        message = '请求的资源不存在'
        break
      case 408:
        message = '请求超时，请稍后重试'
        break
      case 429:
        message = '操作过于频繁，请稍后再试'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        message = '服务器繁忙，请稍后重试'
        break
      default:
        message = data?.message || data?.msg || `请求失败 (${status})`
    }
  } else if (error.code === 'ECONNABORTED') {
    message = '请求超时，请检查网络连接'
  } else if (error.message === 'Network Error') {
    message = '网络连接失败，请检查网络设置'
  } else {
    message = error.message || '未知错误'
  }

  ElMessage.error(message)
  return Promise.reject(error)
}

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 防止重复请求
    const requestKey = generateRequestKey(config)
    if (pendingRequests.has(requestKey)) {
      console.warn(`[取消重复请求] ${config.url}`)
      return Promise.reject(new Error('请求已取消'))
    }

    pendingRequests.set(requestKey, true)
    config.metadata = { requestKey, startTime: Date.now() }

    // 添加认证信息
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    // 模拟模式标记
    if (isMockMode()) {
      config.mockMode = true
    }

    // 添加请求时间戳
    config.headers['X-Request-Time'] = Date.now()

    console.log(`[API请求] ${config.method?.toUpperCase()} ${config.url}`)

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 移除请求记录
    const requestKey = response.config.metadata?.requestKey
    if (requestKey) {
      pendingRequests.delete(requestKey)
    }

    const { config, data } = response
    const duration = Date.now() - (config.metadata?.startTime || 0)
    console.log(`[API响应] ${config.method?.toUpperCase()} ${config.url} (${duration}ms)`, data)

    // 业务成功
    if (data.code === ErrorCodes.SUCCESS || data.code === 200) {
      return data.data
    }

    // 业务错误
    return handleBusinessError(data.code, data.message || data.msg)
  },
  error => {
    // 移除请求记录
    const requestKey = error.config?.metadata?.requestKey
    if (requestKey) {
      pendingRequests.delete(requestKey)
    }

    // 忽略被取消的请求
    if (error.message === '请求已取消') {
      return Promise.reject(error)
    }

    // 模拟模式处理
    if (isMockMode() && error.config?.mockMode) {
      console.log('[模拟模式] 检测到网络错误，切换到模拟数据')
      return handleMockResponse(error)
    }

    // HTTP错误处理
    return handleHttpError(error)
  }
)

/**
 * 取消所有pending请求
 */
export function cancelAllRequests() {
  pendingRequests.clear()
}

export default request
