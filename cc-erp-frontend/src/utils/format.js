/**
 * 数据格式化工具
 */

/**
 * 格式化金额（分转元）
 * @param {number} amount 金额（分）
 * @param {string} symbol 货币符号
 * @returns {string}
 */
export function formatAmount(amount, symbol = '¥') {
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }
  const num = Number(amount) / 100
  return `${symbol}${num.toFixed(2)}`
}

/**
 * 格式化金额（元）
 * @param {number} amount 金额（元）
 * @param {string} symbol 货币符号
 * @returns {string}
 */
export function formatYuan(amount, symbol = '¥') {
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }
  const num = Number(amount)
  return `${symbol}${num.toFixed(2)}`
}

/**
 * 解析金额字符串为分
 * @param {string} amountStr 金额字符串（元）
 * @returns {number} 金额（分）
 */
export function parseAmount(amountStr) {
  if (!amountStr) return 0
  return Math.round(parseFloat(amountStr) * 100)
}

/**
 * 格式化百分比
 * @param {number} value 数值
 * @param {number} decimals 小数位数
 * @returns {string}
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) {
    return '-'
  }
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 格式化数字（千分位）
 * @param {number} num 数字
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined || num === '') {
    return '-'
  }
  return Number(num).toLocaleString('zh-CN')
}

/**
 * 格式化日期时间
 * @param {string|Date} date 日期
 * @param {string} format 格式
 * @returns {string}
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @returns {string}
 */
export function formatDate(date) {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param {string|Date} date 日期
 * @returns {string}
 */
export function formatTime(date) {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 相对时间（多久前）
 * @param {string|Date} date 日期
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '-'

  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 格式化手机号（中间隐藏）
 * @param {string} phone 手机号
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证号（中间隐藏）
 * @param {string} idCard 身份证号
 * @returns {string}
 */
export function formatIdCard(idCard) {
  if (!idCard) return '-'
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 格式化银行卡号（中间隐藏）
 * @param {string} cardNo 银行卡号
 * @returns {string}
 */
export function formatBankCard(cardNo) {
  if (!cardNo) return '-'
  return cardNo.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2')
}

/**
 * 文件大小格式化
 * @param {number} bytes 字节数
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || bytes === 0) return '-'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

/**
 * 状态文本格式化
 * @param {boolean} value 状态值
 * @param {Array} labels [启用标签, 禁用标签]
 * @returns {string}
 */
export function formatStatus(value, labels = ['启用', '禁用']) {
  return value ? labels[0] : labels[1]
}

/**
 * 性别格式化
 * @param {string|number} gender 性别
 * @returns {string}
 */
export function formatGender(gender) {
  const map = {
    '1': '男',
    '2': '女',
    '0': '未知',
    'male': '男',
    'female': '女',
    'unknown': '未知'
  }
  return map[String(gender)] || '未知'
}

/**
 * 数组转逗号分隔字符串
 * @param {Array} arr 数组
 * @param {string} separator 分隔符
 * @returns {string}
 */
export function formatArray(arr, separator = ', ') {
  if (!Array.isArray(arr)) return '-'
  return arr.join(separator)
}

/**
 * 截断文本
 * @param {string} text 文本
 * @param {number} maxLength 最大长度
 * @param {string} suffix 后缀
 * @returns {string}
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * 获取数字的中文表示
 * @param {number} num 数字
 * @returns {string}
 */
export function numberToChinese(num) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千', '万']

  if (num === 0) return digits[0]
  if (num < 10) return digits[num]
  if (num < 20) return '十' + (num % 10 === 0 ? '' : digits[num % 10])

  let result = ''
  let str = String(num)
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i])
    const pos = str.length - i - 1
    if (digit !== 0) {
      result += digits[digit] + units[pos]
    } else if (result[result.length - 1] !== digits[0]) {
      result += digits[0]
    }
  }

  return result.replace(/零+$/, '')
}

/**
 * 清除对象中的空值
 * @param {Object} obj 对象
 * @returns {Object}
 */
export function cleanObject(obj) {
  const result = {}
  for (const key in obj) {
    const value = obj[key]
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value
    }
  }
  return result
}

/**
 * 深度克隆对象
 * @param {*} obj 对象
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))

  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

export default {
  formatAmount,
  formatYuan,
  parseAmount,
  formatPercent,
  formatNumber,
  formatDateTime,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatPhone,
  formatIdCard,
  formatBankCard,
  formatFileSize,
  formatStatus,
  formatGender,
  formatArray,
  truncateText,
  numberToChinese,
  cleanObject,
  deepClone
}
