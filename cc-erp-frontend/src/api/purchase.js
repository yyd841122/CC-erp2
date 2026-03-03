import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEY = 'cc_erp_test_purchase_orders'

// 获取数据
const getData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('读取采购单数据失败:', e)
    return []
  }
}

// 保存数据
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存采购单数据失败:', e)
  }
}

// 生成订单号
const generateOrderNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CG${year}${month}${day}${random}`
}

// 模拟采购单列表
const mockPurchaseOrderList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let orders = getData()

      // 搜索过滤
      if (params.orderNo) {
        orders = orders.filter(o => o.orderNo.includes(params.orderNo))
      }
      if (params.supplierId) {
        orders = orders.filter(o => o.supplierId == params.supplierId)
      }
      if (params.status) {
        orders = orders.filter(o => o.status === params.status)
      }

      // 按日期倒序
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // 分页
      const page = params.page || 1
      const size = params.size || 20
      const start = (page - 1) * size
      const end = start + size

      resolve({
        records: orders.slice(start, end),
        total: orders.length,
        page,
        size
      })
    }, 200)
  })
}

// 模拟采购单详情
const mockPurchaseOrderDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = getData()
      const order = orders.find(o => o.id == id)
      if (order) {
        resolve(order)
      } else {
        reject(new Error('采购单不存在'))
      }
    }, 100)
  })
}

// 模拟创建采购单
const mockCreatePurchaseOrder = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = getData()
      const suppliers = JSON.parse(localStorage.getItem('cc_erp_test_suppliers') || '[]')

      const newId = Math.max(...orders.map(o => o.id), 0) + 1
      const supplier = suppliers.find(s => s.id == data.supplierId)

      const newOrder = {
        ...data,
        id: newId,
        orderNo: generateOrderNo(),
        supplierName: supplier?.supplierName || '',
        status: 'PENDING',
        totalAmount: data.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }

      orders.unshift(newOrder)
      saveData(orders)

      resolve(newOrder)
    }, 300)
  })
}

// 模拟审核采购单
const mockApprovePurchaseOrder = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = getData()
      const index = orders.findIndex(o => o.id == id)
      if (index !== -1) {
        orders[index].status = 'APPROVED'
        orders[index].approvedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        saveData(orders)
        resolve(orders[index])
      } else {
        reject(new Error('采购单不存在'))
      }
    }, 200)
  })
}

// 查询采购单列表
export const getPurchaseOrderList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 采购单列表查询', params)
    return mockPurchaseOrderList(params)
  }
  return request({
    url: '/v1/purchase-orders',
    method: 'get',
    params
  })
}

// 查询采购单详情
export const getPurchaseOrderDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 采购单详情查询', id)
    return mockPurchaseOrderDetail(id)
  }
  return request({
    url: `/v1/purchase-orders/${id}`,
    method: 'get'
  })
}

// 创建采购单
export const createPurchaseOrder = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建采购单', data)
    return mockCreatePurchaseOrder(data)
  }
  return request({
    url: '/v1/purchase-orders',
    method: 'post',
    data
  })
}

// 审核采购单
export const approvePurchaseOrder = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 审核采购单', id)
    return mockApprovePurchaseOrder(id)
  }
  return request({
    url: `/v1/purchase-orders/${id}/approve`,
    method: 'put'
  })
}
