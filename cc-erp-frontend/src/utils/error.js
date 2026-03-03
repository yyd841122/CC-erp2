/**
 * 错误码定义
 */
export const ErrorCodes = {
  // 通用错误
  SUCCESS: 200,
  ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,

  // 业务错误码
  VALIDATION_ERROR: 400,
  DUPLICATE_ERROR: 409,
  RESOURCE_NOT_FOUND: 40401,
  INSUFFICIENT_STOCK: 41001,
  INVALID_STATUS: 41002,
  PAYMENT_ERROR: 42001,

  // 系统错误
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 50001,
  NETWORK_ERROR: 50002
}

/**
 * 错误消息映射
 */
export const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ErrorCodes.FORBIDDEN]: '您没有权限执行此操作',
  [ErrorCodes.NOT_FOUND]: '请求的资源不存在',
  [ErrorCodes.VALIDATION_ERROR]: '数据验证失败，请检查输入',
  [ErrorCodes.DUPLICATE_ERROR]: '数据已存在，请勿重复操作',
  [ErrorCodes.RESOURCE_NOT_FOUND]: '找不到相关数据',
  [ErrorCodes.INSUFFICIENT_STOCK]: '库存不足，无法完成操作',
  [ErrorCodes.INVALID_STATUS]: '当前状态不允许此操作',
  [ErrorCodes.PAYMENT_ERROR]: '支付处理失败',
  [ErrorCodes.SERVER_ERROR]: '服务器繁忙，请稍后重试',
  [ErrorCodes.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ErrorCodes.DATABASE_ERROR]: '数据处理异常',
  [ErrorCodes.NETWORK_ERROR]: '网络连接失败'
}

/**
 * 获取错误消息
 * @param {number|string} code 错误码
 * @param {string} defaultMsg 默认消息
 * @returns {string}
 */
export function getErrorMessage(code, defaultMsg = '操作失败') {
  return ErrorMessages[code] || defaultMsg
}

/**
 * 业务错误类
 */
export class BusinessError extends Error {
  constructor(code, message, data = null) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.data = data
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(errors = []) {
    super('数据验证失败')
    this.name = 'ValidationError'
    this.errors = errors
  }

  /**
   * 获取第一个错误消息
   */
  getFirstMessage() {
    return this.errors[0]?.message || '数据验证失败'
  }

  /**
   * 获取所有错误消息
   */
  getAllMessages() {
    return this.errors.map(e => e.message).join('; ')
  }
}

/**
 * 创建业务错误
 */
export function createBusinessError(code, message, data) {
  return new BusinessError(code, message, data)
}

/**
 * 创建网络错误
 */
export function createNetworkError(message, status) {
  return new NetworkError(message, status)
}

/**
 * 创建验证错误
 */
export function createValidationError(errors) {
  return new ValidationError(errors)
}

export default {
  ErrorCodes,
  ErrorMessages,
  getErrorMessage,
  BusinessError,
  NetworkError,
  ValidationError,
  createBusinessError,
  createNetworkError,
  createValidationError
}
