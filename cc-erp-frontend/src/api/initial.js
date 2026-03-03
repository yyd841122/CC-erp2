import request from '@/utils/request'

// 模拟模式数据
let mockInitialData = {
  isOpened: false,
  openingDate: null,
  inventory: [],
  accountsReceivable: [],
  accountsPayable: [],
  cashBalance: []
}

const STORAGE_KEY = 'cc_erp_initial_balance'

// 从本地存储加载数据
const loadFromStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    mockInitialData = JSON.parse(stored)
  }
}

// 保存到本地存储
const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockInitialData))
}

// 初始化时加载
loadFromStorage()

// 模拟模式检测
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

/**
 * 获取期初开账状态
 */
export function getInitialStatus() {
  if (isMockMode()) {
    return Promise.resolve({
      isOpened: mockInitialData.isOpened,
      openingDate: mockInitialData.openingDate
    })
  }
  return request.get('/api/initial/status')
}

/**
 * 获取期初库存列表
 */
export function getInitialInventory(params) {
  if (isMockMode()) {
    const { page = 1, size = 10, productName } = params
    let data = [...mockInitialData.inventory]

    if (productName) {
      data = data.filter(item => item.productName.includes(productName))
    }

    const start = (page - 1) * size
    const end = start + size

    return Promise.resolve({
      data: data.slice(start, end),
      total: data.length
    })
  }
  return request.get('/api/initial/inventory', { params })
}

/**
 * 保存期初库存
 */
export function saveInitialInventory(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能修改期初数据'))
    }

    // 检查是否已存在相同商品和仓库的记录
    data.forEach(item => {
      const existingIndex = mockInitialData.inventory.findIndex(
        i => i.productId === item.productId && i.warehouseId === item.warehouseId
      )
      if (existingIndex >= 0) {
        mockInitialData.inventory[existingIndex] = item
      } else {
        mockInitialData.inventory.push(item)
      }
    })

    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.post('/api/initial/inventory', data)
}

/**
 * 删除期初库存
 */
export function deleteInitialInventory(id) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能删除期初数据'))
    }
    mockInitialData.inventory = mockInitialData.inventory.filter(item => item.id !== id)
    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.delete(`/api/initial/inventory/${id}`)
}

/**
 * 获取期初应收账款
 */
export function getInitialReceivable(params) {
  if (isMockMode()) {
    const { page = 1, size = 10, customerName } = params
    let data = [...mockInitialData.accountsReceivable]

    if (customerName) {
      data = data.filter(item => item.customerName.includes(customerName))
    }

    const start = (page - 1) * size
    const end = start + size

    return Promise.resolve({
      data: data.slice(start, end),
      total: data.length
    })
  }
  return request.get('/api/initial/receivable', { params })
}

/**
 * 保存期初应收账款
 */
export function saveInitialReceivable(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能修改期初数据'))
    }

    const existingIndex = mockInitialData.accountsReceivable.findIndex(item => item.customerId === data.customerId)
    if (existingIndex >= 0) {
      mockInitialData.accountsReceivable[existingIndex] = data
    } else {
      mockInitialData.accountsReceivable.push(data)
    }

    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.post('/api/initial/receivable', data)
}

/**
 * 删除期初应收账款
 */
export function deleteInitialReceivable(id) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能删除期初数据'))
    }
    mockInitialData.accountsReceivable = mockInitialData.accountsReceivable.filter(item => item.id !== id)
    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.delete(`/api/initial/receivable/${id}`)
}

/**
 * 获取期初应付账款
 */
export function getInitialPayable(params) {
  if (isMockMode()) {
    const { page = 1, size = 10, supplierName } = params
    let data = [...mockInitialData.accountsPayable]

    if (supplierName) {
      data = data.filter(item => item.supplierName.includes(supplierName))
    }

    const start = (page - 1) * size
    const end = start + size

    return Promise.resolve({
      data: data.slice(start, end),
      total: data.length
    })
  }
  return request.get('/api/initial/payable', { params })
}

/**
 * 保存期初应付账款
 */
export function saveInitialPayable(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能修改期初数据'))
    }

    const existingIndex = mockInitialData.accountsPayable.findIndex(item => item.supplierId === data.supplierId)
    if (existingIndex >= 0) {
      mockInitialData.accountsPayable[existingIndex] = data
    } else {
      mockInitialData.accountsPayable.push(data)
    }

    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.post('/api/initial/payable', data)
}

/**
 * 删除期初应付账款
 */
export function deleteInitialPayable(id) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能删除期初数据'))
    }
    mockInitialData.accountsPayable = mockInitialData.accountsPayable.filter(item => item.id !== id)
    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.delete(`/api/initial/payable/${id}`)
}

/**
 * 获取期初现金余额
 */
export function getInitialCashBalance() {
  if (isMockMode()) {
    return Promise.resolve(mockInitialData.cashBalance || [])
  }
  return request.get('/api/initial/cash-balance')
}

/**
 * 保存期初现金余额
 */
export function saveInitialCashBalance(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能修改期初数据'))
    }
    mockInitialData.cashBalance = data
    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.post('/api/initial/cash-balance', data)
}

/**
 * 确认开账
 */
export function confirmOpening(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已经开账，不能重复开账'))
    }

    // 验证期初数据完整性
    if (!data.openingDate) {
      return Promise.reject(new Error('请选择开账日期'))
    }

    mockInitialData.isOpened = true
    mockInitialData.openingDate = data.openingDate
    saveToStorage()

    return Promise.resolve({ success: true, message: '开账成功' })
  }
  return request.post('/api/initial/opening', data)
}

/**
 * 取消开账（仅测试用）
 */
export function cancelOpening() {
  if (isMockMode()) {
    mockInitialData.isOpened = false
    mockInitialData.openingDate = null
    saveToStorage()
    return Promise.resolve({ success: true })
  }
  return request.post('/api/initial/cancel-opening')
}

/**
 * 导入期初库存
 */
export function importInitialInventory(data) {
  if (isMockMode()) {
    if (mockInitialData.isOpened) {
      return Promise.reject(new Error('已开账，不能导入期初数据'))
    }

    data.forEach(item => {
      const existingIndex = mockInitialData.inventory.findIndex(
        i => i.productId === item.productId && i.warehouseId === item.warehouseId
      )
      if (existingIndex >= 0) {
        mockInitialData.inventory[existingIndex] = item
      } else {
        mockInitialData.inventory.push(item)
      }
    })

    saveToStorage()
    return Promise.resolve({ success: true, imported: data.length })
  }
  return request.post('/api/initial/inventory/import', data)
}
