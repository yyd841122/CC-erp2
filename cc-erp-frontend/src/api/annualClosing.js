import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const CLOSING_STORAGE_KEY = 'cc_erp_annual_closing'

// 从 localStorage 获取数据
const getLocalStorageData = () => {
  try {
    const data = localStorage.getItem(CLOSING_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

// 保存到 localStorage
const saveLocalStorageData = (data) => {
  try {
    localStorage.setItem(CLOSING_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

// 获取关账记录列表
export const getClosingList = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getLocalStorageData()
        // 按年度降序排序
        const sorted = data.sort((a, b) => b.year - a.year)
        resolve(sorted)
      }, 200)
    })
  }
  return request({
    url: '/v1/annual-closing/list',
    method: 'get'
  })
}

// 获取关账详情
export const getClosingDetail = (year) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getLocalStorageData()
        const closing = data.find(c => c.year === year)
        resolve(closing || null)
      }, 200)
    })
  }
  return request({
    url: `/v1/annual-closing/detail/${year}`,
    method: 'get'
  })
}

// 执行年终关账
export const performClosing = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const closingList = getLocalStorageData()

        // 检查是否已经关账
        const existing = closingList.find(c => c.year === data.year)
        if (existing) {
          throw new Error(`${data.year}年度已经关账，请勿重复操作`)
        }

        // 获取期末数据，作为下年度期初数据
        const inventory = JSON.parse(localStorage.getItem('cc_erp_test_inventory') || '[]')
        const financeData = JSON.parse(localStorage.getItem('cc_erp_test_finance') || '{}')
        const initialBalance = JSON.parse(localStorage.getItem('cc_erp_initial_balance') || '{}')

        // 计算期末应收应付（未结清的）
        const receivables = (financeData.receivables || []).filter(r => r.status !== 'paid')
        const payables = (financeData.payables || []).filter(p => p.status !== 'paid')

        // 计算期末现金余额 = 期初现金 + 已收金额 - 已付金额
        const initialCash = initialBalance.openingCash || 0
        const receiptsTotal = (financeData.receipts || []).reduce((sum, r) => sum + (r.amount || 0), 0)
        const paymentsTotal = (financeData.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
        const endingCash = initialCash + receiptsTotal - paymentsTotal

        // 准备下年度开账数据
        const nextYearData = {
          year: String(parseInt(data.year) + 1),
          prevClosedYear: data.year,
          needsOpening: true,
          openingInventory: inventory.map(item => ({
            productId: item.productId,
            productName: item.productName,
            warehouseId: item.warehouseId,
            quantity: item.quantity || 0,
            costPrice: item.costPrice || 0
          })),
          openingReceivables: receivables.map(r => ({
            customerId: r.customerId,
            customerName: r.customerName,
            amount: (r.amount || 0) - (r.paidAmount || 0)
          })),
          openingPayables: payables.map(p => ({
            supplierId: p.supplierId,
            supplierName: p.supplierName,
            amount: (p.amount || 0) - (p.paidAmount || 0)
          })),
          openingCash: endingCash,
          closingDate: new Date().toISOString().split('T')[0]
        }

        // 保存下年度开账准备数据
        localStorage.setItem('cc_erp_next_year_opening', JSON.stringify(nextYearData))

        // 创建关账记录
        const newClosing = {
          id: Date.now(),
          year: data.year,
          closingDate: new Date().toISOString().split('T')[0],
          status: 'closed',
          operator: data.operator || '管理员',
          operatorId: data.operatorId,
          remark: data.remark || '',
          summary: data.summary || {},
          nextYearData: nextYearData
        }

        closingList.push(newClosing)
        saveLocalStorageData(closingList)

        resolve(newClosing)
      }, 300)
    })
  }
  return request({
    url: '/v1/annual-closing/perform',
    method: 'post',
    data
  })
}

// 反结账（取消关账）
export const cancelClosing = (year) => {
  if (isMockMode()) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const closingList = getLocalStorageData()
        const index = closingList.findIndex(c => c.year === year)

        if (index === -1) {
          reject(new Error('未找到该年度的关账记录'))
          return
        }

        // 删除关账记录
        closingList.splice(index, 1)
        saveLocalStorageData(closingList)

        resolve({ success: true })
      }, 200)
    })
  }
  return request({
    url: `/v1/annual-closing/cancel/${year}`,
    method: 'post'
  })
}

// 获取关账年度的财务汇总
export const getClosingSummary = (year) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 从 localStorage 读取相关数据计算汇总
        const salesOrders = JSON.parse(localStorage.getItem('cc_erp_test_sales_orders') || '[]')
        const purchaseOrders = JSON.parse(localStorage.getItem('cc_erp_test_purchase_orders') || '[]')
        const inventory = JSON.parse(localStorage.getItem('cc_erp_test_inventory') || '[]')

        // 筛选该年度的订单
        const yearSales = salesOrders.filter(order => order.orderDate && order.orderDate.startsWith(year))
        const yearPurchase = purchaseOrders.filter(order => order.orderDate && order.orderDate.startsWith(year))

        // 计算汇总
        const summary = {
          year: year,
          salesCount: yearSales.length,
          salesAmount: yearSales.reduce((sum, order) => sum + (order.finalAmount || 0), 0),
          purchaseCount: yearPurchase.length,
          purchaseAmount: yearPurchase.reduce((sum, order) => sum + (order.finalAmount || 0), 0),
          inventoryValue: inventory.reduce((sum, item) => {
            return sum + (item.quantity || 0) * (item.costPrice || 0)
          }, 0),
          profit: 0 // 简化处理
        }

        summary.profit = summary.salesAmount - summary.purchaseAmount

        resolve(summary)
      }, 200)
    })
  }
  return request({
    url: `/v1/annual-closing/summary/${year}`,
    method: 'get'
  })
}

// 检查某年度是否已关账
export const checkYearClosed = (year) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const closingList = getLocalStorageData()
        const closed = closingList.some(c => c.year === year && c.status === 'closed')
        resolve({ closed, year })
      }, 100)
    })
  }
  return request({
    url: `/v1/annual-closing/check/${year}`,
    method: 'get'
  })
}

// 检查订单是否在已关账期间
export const checkOrderInClosedPeriod = (orderDate) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const closingList = getLocalStorageData()
        const year = orderDate.substring(0, 4)

        // 检查该年度是否已关账
        const closing = closingList.find(c => c.year === year && c.status === 'closed')

        if (closing) {
          resolve({
            locked: true,
            year: year,
            closingDate: closing.closingDate,
            message: `${year}年度已关账，该订单不可修改`
          })
        } else {
          resolve({ locked: false })
        }
      }, 100)
    })
  }
  return request({
    url: '/v1/annual-closing/check-order',
    method: 'post',
    data: { orderDate }
  })
}

// 获取下年度开账准备数据
export const getNextYearOpening = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('cc_erp_next_year_opening') || 'null')
        resolve(data)
      }, 100)
    })
  }
  return request({
    url: '/v1/annual-closing/next-year-opening',
    method: 'get'
  })
}

// 确认下年度开账
export const confirmNextYearOpening = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 更新期初开账数据
        const currentInitialBalance = JSON.parse(localStorage.getItem('cc_erp_initial_balance') || '{}')

        const newInitialBalance = {
          openingDate: data.openingDate,
          openingInventory: data.openingInventory || [],
          openingReceivables: data.openingReceivables || [],
          openingPayables: data.openingPayables || [],
          openingCash: data.openingCash || 0,
          isConfirmed: true,
          confirmedAt: new Date().toISOString(),
          confirmedBy: data.operator || '管理员',
          prevClosedYear: data.prevClosedYear,
          currentYear: data.year
        }

        localStorage.setItem('cc_erp_initial_balance', JSON.stringify(newInitialBalance))

        // 清除下年度开账准备数据
        localStorage.removeItem('cc_erp_next_year_opening')

        resolve({ success: true, data: newInitialBalance })
      }, 200)
    })
  }
  return request({
    url: '/v1/annual-closing/confirm-next-year',
    method: 'post',
    data
  })
}

// 检查某年度是否需要开账
export const checkYearNeedsOpening = (year) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextYearData = JSON.parse(localStorage.getItem('cc_erp_next_year_opening') || 'null')
        const needsOpening = nextYearData && nextYearData.year === year && nextYearData.needsOpening

        // 获取当前期初开账数据
        const initialBalance = JSON.parse(localStorage.getItem('cc_erp_initial_balance') || '{}')

        resolve({
          year,
          needsOpening: needsOpening || false,
          prevClosedYear: nextYearData?.prevClosedYear || null,
          currentYear: initialBalance.currentYear || null
        })
      }, 100)
    })
  }
  return request({
    url: `/v1/annual-closing/check-needs-opening/${year}`,
    method: 'get'
  })
}
