/**
 * 通用表单验证规则
 */

// 手机号验证
export const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^1[3-9]\d{9}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

// 固定电话验证
export const validateTel = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^0\d{2,3}-?\d{7,8}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的固定电话（如：010-12345678）'))
  } else {
    callback()
  }
}

// 邮箱验证
export const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

// 身份证号验证
export const validateIdCard = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的身份证号码'))
  } else {
    callback()
  }
}

// 统一社会信用代码验证
export const validateCreditCode = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的统一社会信用代码'))
  } else {
    callback()
  }
}

// 银行卡号验证
export const validateBankCard = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^\d{16,19}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的银行卡号'))
  } else {
    callback()
  }
}

// 密码验证（8-20位，包含字母和数字）
export const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/
  if (!reg.test(value)) {
    callback(new Error('密码长度8-20位，必须包含字母和数字'))
  } else {
    callback()
  }
}

// 网址验证
export const validateUrl = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的网址'))
  } else {
    callback()
  }
}

// 正整数验证
export const validatePositiveInteger = (rule, value, callback) => {
  if (value === undefined || value === null || value === '') {
    callback()
    return
  }
  const reg = /^[1-9]\d*$/
  if (!reg.test(value)) {
    callback(new Error('请输入正整数'))
  } else {
    callback()
  }
}

// 金额验证（最多两位小数）
export const validateAmount = (rule, value, callback) => {
  if (value === undefined || value === null || value === '') {
    callback()
    return
  }
  const reg = /^(0|[1-9]\d*)(\.\d{1,2})?$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的金额，最多两位小数'))
  } else {
    callback()
  }
}

// 编码验证（大写字母+数字，如：P00001）
export const validateCode = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[A-Z]+\d+$/
  if (!reg.test(value)) {
    callback(new Error('编码格式不正确，应为大写字母加数字'))
  } else {
    callback()
  }
}

// 角色编码验证（大写字母和下划线）
export const validateRoleCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入角色编码'))
    return
  }
  const reg = /^[A-Z_]+$/
  if (!reg.test(value)) {
    callback(new Error('角色编码只能包含大写字母和下划线'))
  } else {
    callback()
  }
}

// 车牌号验证
export const validateCarNumber = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9]$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的车牌号'))
  } else {
    callback()
  }
}

// QQ号验证
export const validateQQ = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[1-9]\d{4,10}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的QQ号'))
  } else {
    callback()
  }
}

// 微信号验证
export const validateWechat = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/
  if (!reg.test(value)) {
    callback(new Error('微信号由字母开头，6-20位字母、数字、下划线或减号组成'))
  } else {
    callback()
  }
}

// 邮编验证
export const validatePostcode = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[1-9]\d{5}$/
  if (!reg.test(value)) {
    callback(new Error('请输入正确的邮政编码'))
  } else {
    callback()
  }
}

// 数字范围验证生成器
export const validateRange = (min, max, message) => {
  return (rule, value, callback) => {
    if (value === undefined || value === null || value === '') {
      callback()
      return
    }
    const num = Number(value)
    if (isNaN(num) || num < min || num > max) {
      callback(new Error(message || `请输入${min}到${max}之间的数字`))
    } else {
      callback()
    }
  }
}

// 字符串长度验证生成器
export const validateLength = (min, max, message) => {
  return (rule, value, callback) => {
    if (!value) {
      callback()
      return
    }
    const len = value.length
    if (len < min || len > max) {
      callback(new Error(message || `长度应在${min}到${max}个字符之间`))
    } else {
      callback()
    }
  }
}

// 不包含特殊字符验证
export const validateNoSpecialChars = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/
  if (!reg.test(value)) {
    callback(new Error('不能包含特殊字符'))
  } else {
    callback()
  }
}

/**
 * 导出常用验证规则对象
 */
export const commonRules = {
  // 必填
  required: (message = '此项为必填项') => ({
    required: true,
    message,
    trigger: 'blur'
  }),

  // 手机号
  phone: {
    validator: validatePhone,
    trigger: 'blur'
  },

  // 邮箱
  email: {
    validator: validateEmail,
    trigger: 'blur'
  },

  // 身份证
  idCard: {
    validator: validateIdCard,
    trigger: 'blur'
  },

  // 统一社会信用代码
  creditCode: {
    validator: validateCreditCode,
    trigger: 'blur'
  },

  // 正整数
  positiveInteger: {
    validator: validatePositiveInteger,
    trigger: 'blur'
  },

  // 金额
  amount: {
    validator: validateAmount,
    trigger: 'blur'
  }
}

export default {
  validatePhone,
  validateTel,
  validateEmail,
  validateIdCard,
  validateCreditCode,
  validateBankCard,
  validatePassword,
  validateUrl,
  validatePositiveInteger,
  validateAmount,
  validateCode,
  validateRoleCode,
  validateCarNumber,
  validateQQ,
  validateWechat,
  validatePostcode,
  validateRange,
  validateLength,
  validateNoSpecialChars,
  commonRules
}
