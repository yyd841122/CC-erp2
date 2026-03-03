import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEY = 'cc_erp_test_sales_orders'

// 获取数据
const getData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('读取销售单数据失败:', e)
    return []
  }
}

// 保存数据
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存销售单数据失败:', e)
  }
}

// 生成订单号
const generateOrderNo = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `XS${year}${month}${day}${random}`
}

// 模拟销售单列表
const mockSalesOrderList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let orders = getData()

      // 搜索过滤
      if (params.orderNo) {
        orders = orders.filter(o => o.orderNo.includes(params.orderNo))
      }
      if (params.customerId) {
        orders = orders.filter(o => o.customerId == params.customerId)
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

// 模拟销售单详情
const mockSalesOrderDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = getData()
      const order = orders.find(o => o.id == id)
      if (order) {
        resolve(order)
      } else {
        reject(new Error('销售单不存在'))
      }
    }, 100)
  })
}

// 模拟创建销售单
const mockCreateSalesOrder = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orders = getData()
      const customers = JSON.parse(localStorage.getItem('cc_erp_test_customers') || '[]')

      const newId = Math.max(...orders.map(o => o.id), 0) + 1
      const customer = customers.find(c => c.id == data.customerId)

      const newOrder = {
        ...data,
        id: newId,
        orderNo: generateOrderNo(),
        customerName: customer?.customerName || '',
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

// 模拟审核销售单
const mockApproveSalesOrder = (id) => {
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
        reject(new Error('销售单不存在'))
      }
    }, 200)
  })
}

// 模拟作废销售单
const mockCancelSalesOrder = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orders = getData()
      const index = orders.findIndex(o => o.id == id)
      if (index !== -1) {
        orders[index].status = 'CANCELLED'
        orders[index].cancelledAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
        saveData(orders)
        resolve(orders[index])
      } else {
        reject(new Error('销售单不存在'))
      }
    }, 200)
  })
}

// 查询销售单列表
export const getSalesOrderList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 销售单列表查询', params)
    return mockSalesOrderList(params)
  }
  return request({
    url: '/v1/sales-orders',
    method: 'get',
    params
  })
}

// 查询销售单详情
export const getSalesOrderDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 销售单详情查询', id)
    return mockSalesOrderDetail(id)
  }
  return request({
    url: `/v1/sales-orders/${id}`,
    method: 'get'
  })
}

// 创建销售单
export const createSalesOrder = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建销售单', data)
    return mockCreateSalesOrder(data)
  }
  return request({
    url: '/v1/sales-orders',
    method: 'post',
    data
  })
}

// 审核销售单
export const approveSalesOrder = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 审核销售单', id)
    return mockApproveSalesOrder(id)
  }
  return request({
    url: `/v1/sales-orders/${id}/approve`,
    method: 'put'
  })
}

// 作废销售单
export const cancelSalesOrder = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 作废销售单', id)
    return mockCancelSalesOrder(id)
  }
  return request({
    url: `/v1/sales-orders/${id}/cancel`,
    method: 'put'
  })
}
