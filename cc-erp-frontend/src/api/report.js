/**
 * 报表统计 API
 */
import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// 从 localStorage 获取数据
const getLocalStorageData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch (e) {
    return []
  }
}

// 获取日期范围
const getDateRange = (params) => {
  const { startDate, endDate, quickDate } = params
  if (startDate && endDate) {
    return { start: new Date(startDate), end: new Date(endDate) }
  }

  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (quickDate) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() + (6 - now.getDay()))
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'lastMonth':
      start.setMonth(now.getMonth() - 1, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'quarter':
      start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 3, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
    default:
      // 默认本月
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
  }

  return { start, end }
}

// 检查日期是否在范围内
const isDateInRange = (dateStr, range) => {
  if (!dateStr || !range) return true
  const date = new Date(dateStr)
  return date >= range.start && date <= range.end
}

// 生成销售报表数据（从真实数据计算）
const generateSalesReport = (params) => {
  const salesOrders = getLocalStorageData('cc_erp_test_sales_orders')
  const products = getLocalStorageData('cc_erp_test_products')
  const customers = getLocalStorageData('cc_erp_test_customers')
  const range = getDateRange(params)

  // 过滤日期范围内的订单
  const filteredOrders = salesOrders.filter(order => {
    return order.orderDate && isDateInRange(order.orderDate, range) && order.status !== '已作废'
  })

  // 计算 KPI
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const orderCount = filteredOrders.length
  const profit = Math.round(totalSales * 0.25) // 假设利润率 25%
  const customerCount = new Set(filteredOrders.map(o => o.customerId)).size

  // 按商品统计
  const productStats = new Map()
  filteredOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const key = item.productId
      if (!productStats.has(key)) {
        const product = products.find(p => p.id === key)
        productStats.set(key, {
          productCode: product?.productCode || '',
          productName: product?.productName || '',
          quantity: 0,
          amount: 0
        })
      }
      const stat = productStats.get(key)
      stat.quantity += (item.quantity || 0)
      stat.amount += (item.quantity || 0) * (item.price || 0)
    })
  })

  // 商品排行
  const ranking = Array.from(productStats.values())
    .map(item => ({
      ...item,
      profit: Math.round(item.amount * 0.3),
      profitRate: 30
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  // 按分类统计
  const categoryStats = new Map()
  filteredOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const product = products.find(p => p.id === item.productId)
      const categoryId = product?.categoryId
      if (categoryId) {
        const categories = getLocalStorageData('cc_erp_categories')
        const category = categories.find(c => c.id === categoryId)
        const categoryName = category?.categoryName || '未分类'
        if (!categoryStats.has(categoryName)) {
          categoryStats.set(categoryName, 0)
        }
        categoryStats.set(categoryName, categoryStats.get(categoryName) + (item.quantity || 0) * (item.price || 0))
      }
    })
  })

  const composition = Array.from(categoryStats.entries()).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }))

  return {
    kpi: { totalSales, orderCount, profit, customerCount },
    trend: {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      sales: Array(12).fill(0),
      orders: Array(12).fill(0)
    },
    composition,
    ranking
  }
}

// 生成采购报表数据
const generatePurchaseReport = (params) => {
  const purchaseOrders = getLocalStorageData('cc_erp_test_purchase_orders')
  const products = getLocalStorageData('cc_erp_test_products')
  const suppliers = getLocalStorageData('cc_erp_test_suppliers')
  const range = getDateRange(params)

  const filteredOrders = purchaseOrders.filter(order => {
    return order.orderDate && isDateInRange(order.orderDate, range)
  })

  const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const orderCount = filteredOrders.length
  const supplierCount = new Set(filteredOrders.map(o => o.supplierId)).size

  // 按供应商统计
  const supplierStats = new Map()
  filteredOrders.forEach(order => {
    const key = order.supplierId
    if (!supplierStats.has(key)) {
      supplierStats.set(key, { amount: 0, supplierName: '' })
    }
    supplierStats.get(key).amount += (order.totalAmount || 0)
    const supplier = suppliers.find(s => s.id === key)
    supplierStats.get(key).supplierName = supplier?.name || '未知供应商'
  })

  const supplierRatio = Array.from(supplierStats.values()).map(v => ({
    name: v.supplierName,
    value: Math.round(v.amount)
  }))

  return {
    kpi: { totalAmount, orderCount, supplierCount, pendingAmount: 0 },
    trend: {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      purchase: Array(12).fill(0),
      stock: Array(12).fill(0)
    },
    supplierRatio,
    details: []
  }
}

// 生成库存报表数据
const generateInventoryReport = (params) => {
  const products = getLocalStorageData('cc_erp_test_products')
  const warehouses = getLocalStorageData('cc_erp_test_warehouses')

  const totalProducts = products.length
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length
  const overStockCount = products.filter(p => (p.stock || 0) > 1000).length
  const totalValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.purchasePrice || 0), 0)

  const stockStatus = products.map(p => ({
    productCode: p.productCode,
    productName: p.productName,
    quantity: p.stock || 0,
    minStock: 10,
    maxStock: 1000,
    status: (p.stock || 0) === 0 ? 'empty' : (p.stock || 0) < 10 ? 'low' : (p.stock || 0) > 1000 ? 'high' : 'normal'
  }))

  const warehouseDistribution = warehouses.map(w => ({
    warehouseName: w.name,
    productCount: Math.round(products.length / (warehouses.length || 1)),
    value: Math.round(totalValue / (warehouses.length || 1))
  }))

  return {
    kpi: { totalProducts, lowStockCount, overStockCount, totalValue },
    stockStatus,
    warehouseDistribution
  }
}

// 生成财务报表数据
const generateFinanceReport = (params) => {
  const receivables = getLocalStorageData('cc_erp_test_finance_receivables')
  const payables = getLocalStorageData('cc_erp_test_finance_payables')
  const receipts = getLocalStorageData('cc_erp_test_finance_receipts')
  const payments = getLocalStorageData('cc_erp_test_finance_payments')
  const range = getDateRange(params)

  // 计算本月收入和支出
  const filteredReceipts = receipts.filter(r => r.receiptDate && isDateInRange(r.receiptDate, range))
  const filteredPayments = payments.filter(p => p.paymentDate && isDateInRange(p.paymentDate, range))

  const totalIncome = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalExpense = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  const receivable = receivables.reduce((sum, r) => sum + ((r.totalAmount || 0) - (r.paidAmount || 0)), 0)
  const payable = payables.reduce((sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0)

  const receivableList = receivables.slice(0, 10).map(r => {
    const customers = getLocalStorageData('cc_erp_test_customers')
    const customer = customers.find(c => c.id === r.customerId)
    return {
      customerName: customer?.name || '未知客户',
      amount: (r.totalAmount || 0) - (r.paidAmount || 0),
      overdue: 0,
      dueDate: r.dueDate || ''
    }
  })

  const payableList = payables.slice(0, 10).map(p => {
    const suppliers = getLocalStorageData('cc_erp_test_suppliers')
    const supplier = suppliers.find(s => s.id === p.supplierId)
    return {
      supplierName: supplier?.name || '未知供应商',
      amount: (p.totalAmount || 0) - (p.paidAmount || 0),
      overdue: 0,
      dueDate: p.dueDate || ''
    }
  })

  return {
    kpi: { totalIncome, totalExpense, receivable, payable },
    cashFlow: {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
      income: Array(6).fill(0),
      expense: Array(6).fill(0)
    },
    receivableList,
    payableList
  }
}

// 生成绩效报表数据
const generatePerformanceReport = (params) => {
  const salesOrders = getLocalStorageData('cc_erp_test_sales_orders')
  const range = getDateRange(params)

  const filteredOrders = salesOrders.filter(order => {
    return order.orderDate && isDateInRange(order.orderDate, range) && order.status !== '已作废'
  })

  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  const targetSales = 500000
  const completionRate = targetSales > 0 ? Math.round((totalSales / targetSales) * 100 * 10) / 10 : 0

  return {
    kpi: {
      totalSales,
      targetSales,
      completionRate,
      growthRate: 0
    },
    ranking: [
      { rank: 1, name: '销售一部', sales: Math.round(totalSales * 0.3), target: Math.round(targetSales * 0.24), rate: 104.8 },
      { rank: 2, name: '销售二部', sales: Math.round(totalSales * 0.25), target: Math.round(targetSales * 0.2), rate: 98.5 },
      { rank: 3, name: '销售三部', sales: Math.round(totalSales * 0.2), target: Math.round(targetSales * 0.18), rate: 95.1 },
      { rank: 4, name: '销售四部', sales: Math.round(totalSales * 0.15), target: Math.round(targetSales * 0.16), rate: 90.5 },
      { rank: 5, name: '销售五部', sales: Math.round(totalSales * 0.1), target: Math.round(targetSales * 0.14), rate: 89.0 }
    ],
    trend: {
      categories: ['销售一部', '销售二部', '销售三部', '销售四部', '销售五部'],
      current: [Math.round(totalSales * 0.3), Math.round(totalSales * 0.25), Math.round(totalSales * 0.2), Math.round(totalSales * 0.15), Math.round(totalSales * 0.1)],
      last: [Math.round(totalSales * 0.25), Math.round(totalSales * 0.2), Math.round(totalSales * 0.18), Math.round(totalSales * 0.12), Math.round(totalSales * 0.1)]
    }
  }
}

/**
 * 查询销售报表
 */
export const getSalesReport = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateSalesReport(params))
      }, 300)
    })
  }
  return request({
    url: '/v1/reports/sales',
    method: 'get',
    params
  })
}

/**
 * 查询采购报表
 */
export const getPurchaseReport = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generatePurchaseReport(params))
      }, 300)
    })
  }
  return request({
    url: '/v1/reports/purchase',
    method: 'get',
    params
  })
}

/**
 * 查询库存报表
 */
export const getInventoryReport = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateInventoryReport(params))
      }, 300)
    })
  }
  return request({
    url: '/v1/reports/inventory',
    method: 'get',
    params
  })
}

/**
 * 查询财务报表
 */
export const getFinanceReport = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateFinanceReport(params))
      }, 300)
    })
  }
  return request({
    url: '/v1/reports/finance',
    method: 'get',
    params
  })
}

/**
 * 查询业绩报表
 */
export const getPerformanceReport = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generatePerformanceReport(params))
      }, 300)
    })
  }
  return request({
    url: '/v1/reports/performance',
    method: 'get',
    params
  })
}

/**
 * 商品销售排行
 */
export const getTopProducts = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const salesOrders = getLocalStorageData('cc_erp_test_sales_orders')
        const products = getLocalStorageData('cc_erp_test_products')
        const productStats = new Map()

        salesOrders.forEach(order => {
          if (order.status !== '已作废') {
            (order.items || []).forEach(item => {
              if (!productStats.has(item.productId)) {
                const product = products.find(p => p.id === item.productId)
                productStats.set(item.productId, {
                  productCode: product?.productCode || '',
                  productName: product?.productName || '',
                  quantity: 0,
                  amount: 0
                })
              }
              const stat = productStats.get(item.productId)
              stat.quantity += (item.quantity || 0)
              stat.amount += (item.quantity || 0) * (item.price || 0)
            })
          }
        })

        const ranking = Array.from(productStats.values())
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10)

        resolve(ranking)
      }, 200)
    })
  }
  return request({
    url: '/v1/reports/top-products',
    method: 'get',
    params
  })
}

/**
 * 导出报表
 */
export const exportReport = (type, params) => {
  const filename = `${type}_report_${Date.now()}.xlsx`

  if (isMockMode()) {
    // 模拟导出
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[模拟模式] 导出报表', type, params)
        resolve({ success: true })
      }, 500)
    })
  }

  return request({
    url: `/v1/reports/${type}/export`,
    method: 'get',
    params,
    responseType: 'blob'
  }).then(blob => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    return { success: true }
  })
}
